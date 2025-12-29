const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.costCode.count();
  console.log('Total cost codes in DB:', count);
  
  const codes = await prisma.costCode.findMany({
    select: {
      code: true,
      name: true,
      projectId: true,
    },
    orderBy: { code: 'asc' }
  });
  
  console.log('\nAll cost codes:');
  codes.forEach(c => console.log(`  ${c.code} - ${c.name} (Project: ${c.projectId})`));
}

main()
  .finally(() => prisma.$disconnect());
