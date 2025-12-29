import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testAuth() {
  console.log('🔍 Testing Authentication Setup...\n');

  try {
    // 1. Check database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected\n');

    // 2. Count users
    const userCount = await prisma.user.count();
    console.log(`2. Total users in database: ${userCount}\n`);

    // 3. List all users
    console.log('3. Users in database:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });
    users.forEach((user) => {
      console.log(`   - ${user.email} | ${user.role} | Active: ${user.active}`);
    });
    console.log('');

    // 4. Test password verification for admin
    console.log('4. Testing password verification for admin@epc.com...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@epc.com' },
    });

    if (adminUser) {
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, adminUser.password);
      console.log(`   Password hash: ${adminUser.password.substring(0, 20)}...`);
      console.log(`   Test password: "${testPassword}"`);
      console.log(`   Password valid: ${isValid ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('   ❌ Admin user not found!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
