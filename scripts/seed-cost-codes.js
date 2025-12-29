// Seed Cost Codes for Testing
// Usage: node scripts/seed-cost-codes.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding cost codes...\n');

  // Get the first project
  const project = await prisma.project.findFirst();
  if (!project) {
    console.error('❌ No project found. Please create a project first.');
    return;
  }

  console.log(`📁 Project: ${project.name} (${project.code})\n`);

  // Get WBS nodes for linking
  const wbsNodes = await prisma.wBS.findMany({
    where: { projectId: project.id },
    take: 3,
  });

  // Sample cost codes
  const costCodes = [
    // Material
    {
      code: 'MAT-001',
      name: 'Steel Pipes',
      description: 'Carbon steel pipes for pipeline construction',
      category: 'MATERIAL',
      budget: 250000,
      wbsId: wbsNodes[0]?.id || null,
    },
    {
      code: 'MAT-002',
      name: 'Valves & Fittings',
      description: 'Ball valves, gate valves, and pipe fittings',
      category: 'MATERIAL',
      budget: 150000,
      wbsId: wbsNodes[0]?.id || null,
    },
    {
      code: 'MAT-003',
      name: 'Electrical Cables',
      description: 'Power and control cables',
      category: 'MATERIAL',
      budget: 180000,
      wbsId: null,
    },
    {
      code: 'MAT-004',
      name: 'Instrumentation',
      description: 'Sensors, transmitters, and control devices',
      category: 'MATERIAL',
      budget: 120000,
      wbsId: null,
    },

    // Labor
    {
      code: 'LAB-001',
      name: 'Welding Labor',
      description: 'Certified welders for pipe welding',
      category: 'LABOR',
      budget: 300000,
      wbsId: wbsNodes[1]?.id || null,
    },
    {
      code: 'LAB-002',
      name: 'Electrical Installation',
      description: 'Electricians for cable installation and termination',
      category: 'LABOR',
      budget: 200000,
      wbsId: null,
    },
    {
      code: 'LAB-003',
      name: 'Civil Works',
      description: 'Labor for foundation and structural work',
      category: 'LABOR',
      budget: 180000,
      wbsId: null,
    },

    // Equipment
    {
      code: 'EQP-001',
      name: 'Crane Rental',
      description: 'Mobile crane 50-ton capacity',
      category: 'EQUIPMENT',
      budget: 150000,
      wbsId: wbsNodes[2]?.id || null,
    },
    {
      code: 'EQP-002',
      name: 'Welding Machines',
      description: 'TIG and MIG welding equipment',
      category: 'EQUIPMENT',
      budget: 80000,
      wbsId: null,
    },
    {
      code: 'EQP-003',
      name: 'Testing Equipment',
      description: 'NDT and pressure testing equipment',
      category: 'EQUIPMENT',
      budget: 100000,
      wbsId: null,
    },

    // Subcontract
    {
      code: 'SUB-001',
      name: 'Painting Subcontract',
      description: 'Surface preparation and painting works',
      category: 'SUBCONTRACT',
      budget: 120000,
      wbsId: null,
    },
    {
      code: 'SUB-002',
      name: 'Insulation Works',
      description: 'Pipe and equipment insulation',
      category: 'SUBCONTRACT',
      budget: 90000,
      wbsId: null,
    },

    // Overhead
    {
      code: 'OVH-001',
      name: 'Project Management',
      description: 'PM office costs and staff',
      category: 'OVERHEAD',
      budget: 200000,
      wbsId: null,
    },
    {
      code: 'OVH-002',
      name: 'Site Facilities',
      description: 'Site office, accommodation, and utilities',
      category: 'OVERHEAD',
      budget: 150000,
      wbsId: null,
    },
  ];

  console.log('Creating cost codes...\n');

  let created = 0;
  for (const costCode of costCodes) {
    try {
      const result = await prisma.costCode.create({
        data: {
          ...costCode,
          projectId: project.id,
        },
      });
      console.log(`✅ ${result.code} - ${result.name} ($${result.budget.toLocaleString()})`);
      created++;
    } catch (error) {
      console.log(`⚠️  ${costCode.code} - Already exists or error`);
    }
  }

  console.log(`\n✨ Created ${created} cost codes`);

  // Show summary by category
  const allCostCodes = await prisma.costCode.findMany({
    where: { projectId: project.id },
  });

  const summary = allCostCodes.reduce((acc, code) => {
    acc[code.category] = (acc[code.category] || 0) + Number(code.budget);
    return acc;
  }, {});

  console.log('\n📊 Budget Summary by Category:');
  Object.entries(summary).forEach(([category, budget]) => {
    console.log(`   ${category.padEnd(15)} $${budget.toLocaleString()}`);
  });

  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  console.log(`   ${'TOTAL'.padEnd(15)} $${total.toLocaleString()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
