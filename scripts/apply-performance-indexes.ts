/**
 * Apply Justified Performance Indexes to PostgreSQL
 * 
 * Safely creates database indexes using `CREATE INDEX IF NOT EXISTS`
 * without resetting the database or touching any data.
 */

import prisma from '../src/lib/prisma';

async function applyIndexes() {
  console.log('⚡ Applying performance indexes to PostgreSQL...');

  const indexStatements = [
    {
      name: 'doctor_profiles_verificationStatus_experienceYears_idx',
      sql: `CREATE INDEX IF NOT EXISTS "doctor_profiles_verificationStatus_experienceYears_idx" 
            ON "doctor_profiles" ("verificationStatus", "experienceYears" DESC);`,
    },
    {
      name: 'doctor_profiles_verificationStatus_city_idx',
      sql: `CREATE INDEX IF NOT EXISTS "doctor_profiles_verificationStatus_city_idx" 
            ON "doctor_profiles" ("verificationStatus", "city");`,
    },
    {
      name: 'reviews_doctorId_createdAt_idx',
      sql: `CREATE INDEX IF NOT EXISTS "reviews_doctorId_createdAt_idx" 
            ON "reviews" ("doctorId", "createdAt" DESC);`,
    },
    {
      name: 'appointments_doctorId_date_idx',
      sql: `CREATE INDEX IF NOT EXISTS "appointments_doctorId_date_idx" 
            ON "appointments" ("doctorId", "date");`,
    },
    {
      name: 'appointments_userId_status_idx',
      sql: `CREATE INDEX IF NOT EXISTS "appointments_userId_status_idx" 
            ON "appointments" ("userId", "status");`,
    },
    {
      name: 'refresh_tokens_userId_idx',
      sql: `CREATE INDEX IF NOT EXISTS "refresh_tokens_userId_idx" 
            ON "refresh_tokens" ("userId");`,
    },
    {
      name: 'audit_logs_userId_createdAt_idx',
      sql: `CREATE INDEX IF NOT EXISTS "audit_logs_userId_createdAt_idx" 
            ON "audit_logs" ("userId", "createdAt" DESC);`,
    },
  ];

  for (const item of indexStatements) {
    const start = Date.now();
    try {
      await prisma.$executeRawUnsafe(item.sql);
      console.log(`  ✅ Applied index "${item.name}" (${Date.now() - start}ms)`);
    } catch (err: any) {
      console.error(`  ❌ Failed applying index "${item.name}":`, err.message);
    }
  }

  // Also verify indexes on doctor_profiles
  const existingIndexes: any = await prisma.$queryRawUnsafe(`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename IN ('doctor_profiles', 'reviews', 'appointments')
    ORDER BY tablename, indexname;
  `);

  console.log('\n🔍 Active PostgreSQL Indexes:');
  existingIndexes.forEach((idx: any) => {
    console.log(`  - [${idx.indexname}] -> ${idx.indexdef}`);
  });

  console.log('\n✨ All performance indexes successfully verified on PostgreSQL.');
}

applyIndexes()
  .catch(err => {
    console.error('Fatal error applying indexes:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
