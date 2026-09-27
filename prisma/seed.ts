import 'dotenv/config';
import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * CuraLink Production Database Seed Script
 * 
 * IMPORTANT:
 * - CuraLink uses 100% REAL data for all clinical operations.
 * - NO fake doctors, placeholder clinicians, or mock patient records are seeded here.
 * - Real doctors are registered via the Doctor Sign Up flow and verified through the Admin portal.
 * - Real patients register via Email or Google OAuth.
 * - This seed script solely ensures the root System Administrator account exists for administrative oversight.
 */
async function main() {
  console.log('🌱 Ensuring essential system administrator account exists...');

  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'AdminSecurePass123!';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  // Seed / Ensure System Administrator
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@curalink.health' },
    update: {
      role: 'ADMIN',
    },
    create: {
      name: 'System Administrator',
      email: 'admin@curalink.health',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  console.log(`✅ System Administrator verified: ${adminUser.name} (${adminUser.email})`);
  console.log('✨ No fake doctors or mock patient records seeded. All clinicians & patients must register through live app flows.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
