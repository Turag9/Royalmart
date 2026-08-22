import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@royalmart.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

async function makeAdmin() {
  try {
    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL.toLowerCase() },
    });

    if (existingUser) {
      // Upgrade existing user to admin
      const updated = await prisma.user.update({
        where: { email: ADMIN_EMAIL.toLowerCase() },
        data: { role: 'ADMIN' },
      });
      console.log(`✅ Existing user upgraded to ADMIN:`);
      console.log(`   Email: ${updated.email}`);
      console.log(`   Name: ${updated.firstName} ${updated.lastName || ''}`);
      console.log(`   Role: ${updated.role}`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      const admin = await prisma.user.create({
        data: {
          firstName: 'Admin',
          email: ADMIN_EMAIL.toLowerCase(),
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log(`✅ New admin user created:`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   Role: ${admin.role}`);
    }

    console.log(`\n🔑 Login at: /admin/login`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
