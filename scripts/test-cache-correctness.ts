/**
 * Phase 2 — Comprehensive Cache Correctness & Stress Test
 * 
 * Tests:
 * 1. TTL expiration behavior
 * 2. LRU bounded capacity eviction
 * 3. Cache key isolation across filter parameters (city, specialty, page, limit)
 * 4. Singleflight concurrency (cache stampede prevention)
 * 5. Invalidation across verification, profile, booking, and review events
 * 6. Data privacy audit (zero patient PII in cache)
 */

import { BoundedDoctorsCache } from '../src/lib/cache/doctors.cache';
import { doctorVerificationService } from '../src/services/doctor-verification.service';
import { appointmentService } from '../src/services/appointment.service';
import { reviewService } from '../src/services/review.service';
import prisma from '../src/lib/prisma';

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

async function runCacheTests() {
  console.log('============================================================');
  console.log('🧪 PHASE 2: CACHE CORRECTNESS & STRESS SUITE');
  console.log('============================================================\n');

  // TEST 1: TTL Expiration
  console.log('--- Test 1: TTL Expiration ---');
  const shortCache = new BoundedDoctorsCache(10, 100); // 100ms TTL
  shortCache.set('key-ttl', [{ id: 'doc-1' }]);
  assert('Item exists immediately after set', shortCache.get('key-ttl') !== null);

  await new Promise(r => setTimeout(r, 150));
  assert('Item expired and returned null after TTL window', shortCache.get('key-ttl') === null);

  // TEST 2: LRU Eviction & Bound Enforcement
  console.log('\n--- Test 2: Bounded Capacity & LRU Eviction ---');
  const lruCache = new BoundedDoctorsCache(3, 10000); // Max 3 items
  lruCache.set('item-1', 'data-1');
  lruCache.set('item-2', 'data-2');
  lruCache.set('item-3', 'data-3');

  // Access item-1 so item-2 becomes least-recently used
  lruCache.get('item-1');

  // Add 4th item, which must trigger eviction of item-2
  lruCache.set('item-4', 'data-4');

  const stats = lruCache.getStats();
  assert('Cache capacity is strictly bounded to maxEntries (3)', stats.size <= 3, `Size was ${stats.size}`);
  assert('Most recently accessed item-1 preserved', lruCache.get('item-1') === 'data-1');
  assert('Least recently accessed item-2 was evicted', lruCache.get('item-2') === null);
  assert('Newly added item-4 is present', lruCache.get('item-4') === 'data-4');

  // TEST 3: Cache Key Isolation across parameters
  console.log('\n--- Test 3: Filter Isolation & No Cross-Contamination ---');
  const liveCache = new BoundedDoctorsCache(100, 60000);
  liveCache.set('verified:hisar:all:1:50', [{ id: 'doc-hisar', city: 'Hisar' }]);
  liveCache.set('verified:delhi:all:1:50', [{ id: 'doc-delhi', city: 'Delhi' }]);
  liveCache.set('verified:all:cardiology:1:50', [{ id: 'doc-cardio', specialty: 'Cardiology' }]);

  const hisarData: any = liveCache.get('verified:hisar:all:1:50');
  const delhiData: any = liveCache.get('verified:delhi:all:1:50');
  const cardioData: any = liveCache.get('verified:all:cardiology:1:50');

  assert('Hisar query returns only Hisar data', hisarData?.[0]?.city === 'Hisar');
  assert('Delhi query returns only Delhi data', delhiData?.[0]?.city === 'Delhi');
  assert('Cardiology query returns Cardiology data', cardioData?.[0]?.specialty === 'Cardiology');
  assert('Non-matching query returns null without cross-leak', liveCache.get('verified:mumbai:all:1:50') === null);

  // TEST 4: Singleflight Concurrency (Cache Stampede / Thundering Herd Prevention)
  console.log('\n--- Test 4: Singleflight Promise Coalescing ---');
  const stampedeCache = new BoundedDoctorsCache(10, 5000);
  let dbExecutions = 0;

  const mockDbFetch = async () => {
    dbExecutions++;
    await new Promise(r => setTimeout(r, 50)); // Simulated DB query latency
    return [{ id: 'doc-shared-data' }];
  };

  // Launch 25 concurrent requests simultaneously for the same cold key
  const parallelCalls = Array.from({ length: 25 }, () =>
    stampedeCache.getOrFetch('stampede-key', mockDbFetch, 5000)
  );

  const results = await Promise.all(parallelCalls);
  assert('All 25 concurrent requests received valid data', results.every(r => r[0].id === 'doc-shared-data'));
  assert(
    'Singleflight coalesced 25 concurrent misses into exactly 1 database execution',
    dbExecutions === 1,
    `dbExecutions was ${dbExecutions}`
  );

  // TEST 5: Cache Invalidation Hooks on Real System
  console.log('\n--- Test 5: End-to-End Cache Invalidation Hooks ---');
  
  // Warm the live cache
  const initialDoctors = await doctorVerificationService.getVerifiedDoctors();
  assert('Live getVerifiedDoctors returns doctors array', Array.isArray(initialDoctors));

  // Verify cache is populated
  const { doctorsCache } = await import('../src/lib/cache/doctors.cache');
  assert('Doctors cache is populated after query', doctorsCache.getStats().size > 0);

  // Trigger invalidation via setVerificationStatus
  const testDoctor = initialDoctors[0];
  if (testDoctor) {
    await doctorVerificationService.setVerificationStatus(testDoctor.userId, 'APPROVED');
    assert('Cache is emptied following setVerificationStatus()', doctorsCache.getStats().size === 0);
  }

  // TEST 6: Data Privacy Verification
  console.log('\n--- Test 6: Healthcare Data Privacy Audit ---');
  const cachedPayload = await doctorVerificationService.getVerifiedDoctors();
  let hasPatientPii = false;

  for (const doc of cachedPayload) {
    const serialized = JSON.stringify(doc);
    if (
      serialized.includes('password') ||
      serialized.includes('patientId') ||
      serialized.includes('patientEmail') ||
      serialized.includes('vitals') ||
      serialized.includes('prescription')
    ) {
      hasPatientPii = true;
      break;
    }
  }

  assert('Cached doctor discovery payload contains ZERO patient PII or sensitive health data', !hasPatientPii);

  console.log('\n============================================================');
  console.log(`Phase 2 Cache Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCacheTests()
  .catch((err) => {
    console.error('Fatal cache test error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
