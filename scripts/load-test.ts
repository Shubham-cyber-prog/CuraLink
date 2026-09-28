/**
 * CuraLink Scalability & Load Testing Harness
 * 
 * Tests API throughput, concurrency tolerance, latency percentiles (P50, P90, P95, P99),
 * and rate-limiting resilience against local or remote CuraLink server instances.
 * 
 * Usage:
 *   npx tsx scripts/load-test.ts
 *   npx tsx scripts/load-test.ts --scenario=health --concurrency=50 --requests=500
 *   npx tsx scripts/load-test.ts --scenario=sweep
 *   npx tsx scripts/load-test.ts --scenario=all
 */

import http from 'http';
import https from 'https';
import { performance } from 'perf_hooks';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';
import { Role } from '../src/types/role';

interface LoadTestOptions {
  name: string;
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  concurrency: number;
  totalRequests: number;
  expectedStatus?: number;
}

interface TestResult {
  scenario: string;
  concurrency: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitedRequests: number;
  statusCodes: Record<number, number>;
  durationMs: number;
  rps: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  avgLatencyMs: number;
  p50Ms: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
  errors: string[];
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const options: Record<string, string> = {};

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value ?? 'true';
    }
  }

  return {
    scenario: options.scenario || 'all',
    concurrency: parseInt(options.concurrency || '20', 10),
    requests: parseInt(options.requests || '200', 10),
    apiHost: options.apiHost || process.env.API_URL || 'http://localhost:5000',
    webHost: options.webHost || process.env.WEB_URL || 'http://localhost:3000',
  };
}

function makeRequest(
  urlStr: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): Promise<{ status: number; latencyMs: number; error?: string }> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const url = new URL(urlStr);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqOptions: http.RequestOptions = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      method,
      headers: {
        'User-Agent': 'CuraLink-LoadTest-Agent/1.0',
        Connection: 'keep-alive',
        ...headers,
      },
      timeout: 10000,
    };

    const req = client.request(reqOptions, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        const latencyMs = Math.round(performance.now() - startTime);
        resolve({ status: res.statusCode || 0, latencyMs });
      });
    });

    req.on('error', (err) => {
      const latencyMs = Math.round(performance.now() - startTime);
      resolve({ status: 0, latencyMs, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      const latencyMs = Math.round(performance.now() - startTime);
      resolve({ status: 408, latencyMs, error: 'Request timeout (10s)' });
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function calculatePercentile(sorted: number[], percentile: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

async function runScenario(opts: LoadTestOptions): Promise<TestResult> {
  console.log(`\n============================================================`);
  console.log(`🚀 SCENARIO: ${opts.name}`);
  console.log(`🎯 Target: ${opts.method || 'GET'} ${opts.url}`);
  console.log(`⚡ Concurrency: ${opts.concurrency} | Total Requests: ${opts.totalRequests}`);
  console.log(`============================================================`);

  const latencies: number[] = [];
  const statusCodes: Record<number, number> = {};
  const errors: string[] = [];

  let completed = 0;
  let inFlight = 0;
  let dispatched = 0;

  const suiteStartTime = performance.now();

  return new Promise((resolve) => {
    function launchNext() {
      if (completed >= opts.totalRequests) {
        return;
      }

      while (inFlight < opts.concurrency && dispatched < opts.totalRequests) {
        inFlight++;
        dispatched++;

        makeRequest(opts.url, opts.method || 'GET', opts.headers || {}, opts.body)
          .then((res) => {
            inFlight--;
            completed++;
            latencies.push(res.latencyMs);

            statusCodes[res.status] = (statusCodes[res.status] || 0) + 1;
            if (res.error) {
              errors.push(res.error);
            }

            if (completed % Math.max(1, Math.floor(opts.totalRequests / 4)) === 0 || completed === opts.totalRequests) {
              const pct = Math.round((completed / opts.totalRequests) * 100);
              process.stdout.write(`   📊 Progress: ${completed}/${opts.totalRequests} (${pct}%) completed...\r`);
            }

            if (completed >= opts.totalRequests) {
              const suiteDuration = performance.now() - suiteStartTime;
              sortedLatenciesReport(suiteDuration);
            } else {
              launchNext();
            }
          })
          .catch((err) => {
            inFlight--;
            completed++;
            errors.push(String(err));
            if (completed >= opts.totalRequests) {
              const suiteDuration = performance.now() - suiteStartTime;
              sortedLatenciesReport(suiteDuration);
            } else {
              launchNext();
            }
          });
      }
    }

    function sortedLatenciesReport(durationMs: number) {
      console.log(''); // New line after progress
      latencies.sort((a, b) => a - b);

      const successfulRequests = Object.entries(statusCodes)
        .filter(([code]) => parseInt(code, 10) >= 200 && parseInt(code, 10) < 300)
        .reduce((sum, [, count]) => sum + count, 0);

      const rateLimitedRequests = statusCodes[429] || 0;
      const failedRequests = opts.totalRequests - successfulRequests - rateLimitedRequests;

      const minLatencyMs = latencies[0] || 0;
      const maxLatencyMs = latencies[latencies.length - 1] || 0;
      const avgLatencyMs = Math.round(latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1));
      const p50Ms = calculatePercentile(latencies, 50);
      const p90Ms = calculatePercentile(latencies, 90);
      const p95Ms = calculatePercentile(latencies, 95);
      const p99Ms = calculatePercentile(latencies, 99);
      const rps = parseFloat(((opts.totalRequests / (durationMs / 1000))).toFixed(1));

      const result: TestResult = {
        scenario: opts.name,
        concurrency: opts.concurrency,
        totalRequests: opts.totalRequests,
        successfulRequests,
        failedRequests,
        rateLimitedRequests,
        statusCodes,
        durationMs: Math.round(durationMs),
        rps,
        minLatencyMs,
        maxLatencyMs,
        avgLatencyMs,
        p50Ms,
        p90Ms,
        p95Ms,
        p99Ms,
        errors: Array.from(new Set(errors)).slice(0, 5),
      };

      printResultSummary(result);
      resolve(result);
    }

    launchNext();
  });
}

function printResultSummary(res: TestResult) {
  const statusDist = Object.entries(res.statusCodes)
    .map(([code, count]) => `${code}: ${count}`)
    .join(', ');

  console.log(`\n📈 RESULTS for "${res.scenario}":`);
  console.log(`   ⏱️  Total Duration : ${res.durationMs} ms`);
  console.log(`   🚀 Throughput     : ${res.rps} req/sec`);
  console.log(`   ✅ 2xx Success    : ${res.successfulRequests} (${Math.round((res.successfulRequests / res.totalRequests) * 100)}%)`);
  if (res.rateLimitedRequests > 0) {
    console.log(`   ⚠️  429 Rate-Limit: ${res.rateLimitedRequests}`);
  }
  if (res.failedRequests > 0) {
    console.log(`   ❌ Failed/Errors  : ${res.failedRequests}`);
  }
  console.log(`   🔢 Status Codes   : [ ${statusDist} ]`);
  console.log(`   ⏱️  Latency P50   : ${res.p50Ms} ms`);
  console.log(`   ⏱️  Latency P90   : ${res.p90Ms} ms`);
  console.log(`   ⏱️  Latency P95   : ${res.p95Ms} ms`);
  console.log(`   ⏱️  Latency P99   : ${res.p99Ms} ms`);
  console.log(`   ⏱️  Latency (Min/Avg/Max): ${res.minLatencyMs} / ${res.avgLatencyMs} / ${res.maxLatencyMs} ms`);

  if (res.errors.length > 0) {
    console.log(`   ⚠️  Distinct Errors:`);
    res.errors.forEach((e) => console.log(`      - ${e}`));
  }
}

async function main() {
  const cfg = parseCliArgs();

  console.log('\n🏥 CuraLink Telehealth Scalability & Load Benchmark');
  console.log(`   Config: API=${cfg.apiHost} | Web=${cfg.webHost}`);
  console.log(`   Scenario=${cfg.scenario} | Concurrency=${cfg.concurrency} | Requests=${cfg.requests}`);

  const results: TestResult[] = [];

  // Generate synthetic test tokens
  const patientToken = jwt.sign(
    { id: 'synth-pat-loadtest-1', email: 'loadpatient@curalink.health', role: Role.PATIENT },
    env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  const sampleDoctorUserId = 'e045bc56-e5dd-49b9-8c89-7d8eb207c784';
  const doctorToken = jwt.sign(
    { id: sampleDoctorUserId, email: 'dr_audit_1790249274673@curalink.health', role: Role.DOCTOR },
    env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  // CONCURRENCY SWEEP MODE (5, 10, 25, 50 VUs)
  if (cfg.scenario === 'sweep') {
    const sweepLevels = [5, 10, 25, 50];
    console.log('\n🔥 RUNNING MULTI-CONCURRENCY SWEEP (5, 10, 25, 50 VUs)...');

    for (const vu of sweepLevels) {
      console.log(`\n============================================================`);
      console.log(`🌟 SWEEP TIER: ${vu} Concurrent Virtual Users`);
      console.log(`============================================================`);

      // 1. Health
      results.push(
        await runScenario({
          name: `Health Check (VU=${vu})`,
          url: `${cfg.apiHost}/health`,
          concurrency: vu,
          totalRequests: vu * 10,
        })
      );

      // 2. Doctor Listings (LRU Cache + Singleflight)
      results.push(
        await runScenario({
          name: `Doctor Listings (VU=${vu})`,
          url: `${cfg.apiHost}/api/doctors/verified`,
          concurrency: vu,
          totalRequests: vu * 5,
        })
      );

      // 3. Doctor Availability
      results.push(
        await runScenario({
          name: `Doctor Availability (VU=${vu})`,
          url: `${cfg.apiHost}/api/doctors/${sampleDoctorUserId}/availability`,
          concurrency: vu,
          totalRequests: vu * 5,
        })
      );

      // 4. Patient Dashboard (Authenticated)
      results.push(
        await runScenario({
          name: `Patient Dashboard (VU=${vu})`,
          url: `${cfg.apiHost}/api/appointments/my-appointments`,
          headers: { Authorization: `Bearer ${patientToken}` },
          concurrency: vu,
          totalRequests: vu * 5,
        })
      );
    }
  }

  // INDIVIDUAL SCENARIOS
  // SCENARIO 1: Server I/O & Express Health Baseline (No DB)
  if (cfg.scenario === 'all' || cfg.scenario === 'health') {
    results.push(
      await runScenario({
        name: '1. Baseline Express Throughput (/health)',
        url: `${cfg.apiHost}/health`,
        concurrency: cfg.concurrency,
        totalRequests: cfg.requests,
      })
    );
  }

  // SCENARIO 2: Verified-Doctor Listing (Bounded Cache + DB)
  if (cfg.scenario === 'all' || cfg.scenario === 'doctors') {
    results.push(
      await runScenario({
        name: '2. Verified-Doctor Listing (/api/doctors/verified)',
        url: `${cfg.apiHost}/api/doctors/verified`,
        concurrency: cfg.concurrency,
        totalRequests: Math.min(cfg.requests, 100),
      })
    );
  }

  // SCENARIO 3: Doctor Discovery with Filters and Pagination
  if (cfg.scenario === 'all' || cfg.scenario === 'doctors_filter') {
    results.push(
      await runScenario({
        name: '3. Doctor Discovery with Filters & Pagination',
        url: `${cfg.apiHost}/api/doctors/verified?city=Kolkata&specialty=General+Practice&page=1&limit=5`,
        concurrency: Math.min(cfg.concurrency, 25),
        totalRequests: Math.min(cfg.requests, 60),
      })
    );
  }

  // SCENARIO 4: Authentication Pipeline (POST /api/auth/login)
  if (cfg.scenario === 'all' || cfg.scenario === 'auth') {
    results.push(
      await runScenario({
        name: '4. Authentication Endpoint (Login Validation)',
        url: `${cfg.apiHost}/api/auth/login`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'synth_nonexistent@curalink.health', password: 'Password123!' }),
        concurrency: 5,
        totalRequests: 10,
      })
    );
  }

  // SCENARIO 5: Appointment Availability Query
  if (cfg.scenario === 'all' || cfg.scenario === 'availability') {
    results.push(
      await runScenario({
        name: '5. Doctor Availability (/api/doctors/:id/availability)',
        url: `${cfg.apiHost}/api/doctors/${sampleDoctorUserId}/availability`,
        concurrency: Math.min(cfg.concurrency, 25),
        totalRequests: Math.min(cfg.requests, 60),
      })
    );
  }

  // SCENARIO 6: Patient Dashboard Appointments
  if (cfg.scenario === 'all' || cfg.scenario === 'patient_dash') {
    results.push(
      await runScenario({
        name: '6. Patient Dashboard (/api/appointments/my-appointments)',
        url: `${cfg.apiHost}/api/appointments/my-appointments`,
        headers: { Authorization: `Bearer ${patientToken}` },
        concurrency: Math.min(cfg.concurrency, 25),
        totalRequests: Math.min(cfg.requests, 60),
      })
    );
  }

  // SCENARIO 7: Doctor Dashboard Stats
  if (cfg.scenario === 'all' || cfg.scenario === 'doctor_dash') {
    results.push(
      await runScenario({
        name: '7. Doctor Dashboard Stats (/api/doctor/me/dashboard-stats)',
        url: `${cfg.apiHost}/api/doctor/me/dashboard-stats`,
        headers: { Authorization: `Bearer ${doctorToken}` },
        concurrency: Math.min(cfg.concurrency, 25),
        totalRequests: Math.min(cfg.requests, 60),
      })
    );
  }

  // SCENARIO 8: Next.js Frontend Rendering (Static/SSR)
  if (cfg.scenario === 'all' || cfg.scenario === 'ssr') {
    results.push(
      await runScenario({
        name: '8. Next.js Frontend SSR/Static Load (/)',
        url: `${cfg.webHost}/`,
        concurrency: Math.min(cfg.concurrency, 20),
        totalRequests: Math.min(cfg.requests, 100),
      })
    );
  }

  // SCENARIO 9: Rate Limiting Enforcement
  if (cfg.scenario === 'all' || cfg.scenario === 'ratelimit') {
    results.push(
      await runScenario({
        name: '9. Rate Limiter Burst Tolerance (60 req/min limit check)',
        url: `${cfg.apiHost}/api/doctors/verified`,
        concurrency: 20,
        totalRequests: 80,
      })
    );
  }

  // SCENARIO 10: Realistic Mixed Workload
  if (cfg.scenario === 'all' || cfg.scenario === 'mixed') {
    const mixedEndpoints = [
      { url: `${cfg.apiHost}/health`, method: 'GET' },
      { url: `${cfg.apiHost}/api/doctors/verified`, method: 'GET' },
      { url: `${cfg.apiHost}/api/doctors/${sampleDoctorUserId}/availability`, method: 'GET' },
      { url: `${cfg.apiHost}/api/appointments/my-appointments`, method: 'GET', headers: { Authorization: `Bearer ${patientToken}` } },
      { url: `${cfg.webHost}/`, method: 'GET' },
    ];
    let pickIdx = 0;

    console.log(`\n============================================================`);
    console.log(`🚀 SCENARIO: 10. Realistic Mixed Workload (Patient + Doctor + Web)`);
    console.log(`⚡ Concurrency: ${cfg.concurrency} | Total Requests: ${cfg.requests}`);
    console.log(`============================================================`);

    const mixedLatencies: number[] = [];
    const mixedStatusCodes: Record<number, number> = {};
    const mixedErrors: string[] = [];
    const mixedStart = performance.now();

    await new Promise<void>((resolve) => {
      let completed = 0;
      let inFlight = 0;
      let dispatched = 0;

      function next() {
        if (completed >= cfg.requests) return;

        while (inFlight < cfg.concurrency && dispatched < cfg.requests) {
          inFlight++;
          dispatched++;
          const target = mixedEndpoints[pickIdx++ % mixedEndpoints.length];

          makeRequest(target.url, target.method, target.headers || {})
            .then((res) => {
              inFlight--;
              completed++;
              mixedLatencies.push(res.latencyMs);
              mixedStatusCodes[res.status] = (mixedStatusCodes[res.status] || 0) + 1;
              if (res.error) mixedErrors.push(res.error);

              if (completed >= cfg.requests) {
                resolve();
              } else {
                next();
              }
            })
            .catch((err) => {
              inFlight--;
              completed++;
              mixedErrors.push(String(err));
              if (completed >= cfg.requests) {
                resolve();
              } else {
                next();
              }
            });
        }
      }
      next();
    });

    const mixedDuration = performance.now() - mixedStart;
    mixedLatencies.sort((a, b) => a - b);

    const successfulRequests = Object.entries(mixedStatusCodes)
      .filter(([code]) => parseInt(code, 10) >= 200 && parseInt(code, 10) < 300)
      .reduce((sum, [, count]) => sum + count, 0);

    const rateLimitedRequests = mixedStatusCodes[429] || 0;
    const failedRequests = cfg.requests - successfulRequests - rateLimitedRequests;

    const rps = parseFloat((cfg.requests / (mixedDuration / 1000)).toFixed(1));
    const result: TestResult = {
      scenario: '10. Realistic Mixed Workload',
      concurrency: cfg.concurrency,
      totalRequests: cfg.requests,
      successfulRequests,
      failedRequests,
      rateLimitedRequests,
      statusCodes: mixedStatusCodes,
      durationMs: Math.round(mixedDuration),
      rps,
      minLatencyMs: mixedLatencies[0] || 0,
      maxLatencyMs: mixedLatencies[mixedLatencies.length - 1] || 0,
      avgLatencyMs: Math.round(mixedLatencies.reduce((a, b) => a + b, 0) / (mixedLatencies.length || 1)),
      p50Ms: calculatePercentile(mixedLatencies, 50),
      p90Ms: calculatePercentile(mixedLatencies, 90),
      p95Ms: calculatePercentile(mixedLatencies, 95),
      p99Ms: calculatePercentile(mixedLatencies, 99),
      errors: Array.from(new Set(mixedErrors)).slice(0, 5),
    };

    printResultSummary(result);
    results.push(result);
  }

  // Overall Scorecard
  console.log('\n============================================================');
  console.log('🏆 CURALINK SCALABILITY BENCHMARK SCORECARD');
  console.log('============================================================');
  console.log(
    'Scenario'.padEnd(46) +
    'RPS'.padEnd(10) +
    'P50'.padEnd(9) +
    'P95'.padEnd(9) +
    'P99'.padEnd(9) +
    'Success'
  );
  console.log('-'.repeat(90));

  for (const r of results) {
    const successRate = `${Math.round(((r.successfulRequests + r.rateLimitedRequests) / r.totalRequests) * 100)}%`;
    console.log(
      r.scenario.slice(0, 44).padEnd(46) +
      `${r.rps}`.padEnd(10) +
      `${r.p50Ms}ms`.padEnd(9) +
      `${r.p95Ms}ms`.padEnd(9) +
      `${r.p99Ms}ms`.padEnd(9) +
      successRate
    );
  }
  console.log('============================================================\n');
}

main().catch((err) => {
  console.error('Fatal load test error:', err);
  process.exit(1);
});
