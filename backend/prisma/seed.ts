import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@epc.com' },
    update: {},
    create: {
      email: 'admin@epc.com',
      password: hashedPassword,
      name: 'System Admin',
      role: UserRole.ADMIN,
      active: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  const pm = await prisma.user.upsert({
    where: { email: 'pm@epc.com' },
    update: {},
    create: {
      email: 'pm@epc.com',
      password: hashedPassword,
      name: 'Project Manager',
      role: UserRole.PROJECT_MANAGER,
      active: true,
    },
  });

  console.log('✅ Project Manager created:', pm.email);

  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@epc.com' },
    update: {},
    create: {
      email: 'engineer@epc.com',
      password: hashedPassword,
      name: 'Project Control Engineer',
      role: UserRole.PROJECT_CONTROL_ENGINEER,
      active: true,
    },
  });

  console.log('✅ Project Control Engineer created:', engineer.email);

  console.log('\n✨ Seeding completed!');
  console.log('\n📝 Default login credentials:');
  console.log('Email: admin@epc.com | Password: admin123');
  console.log('Email: pm@epc.com | Password: admin123');
  console.log('Email: engineer@epc.com | Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
