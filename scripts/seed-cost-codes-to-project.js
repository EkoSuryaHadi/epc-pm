// Seed Cost Codes to Specific Project
// Usage: node scripts/seed-cost-codes-to-project.js [projectId]

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projectId = process.argv[2];

  if (!projectId) {
    // Show all projects
    const projects = await prisma.project.findMany({
      select: { id: true, code: true, name: true }
    });
    console.log('Available projects:\n');
    projects.forEach(p => {
      console.log(`${p.id}`);
      console.log(`  ${p.code} - ${p.name}\n`);
    });
    console.log('Usage: node scripts/seed-cost-codes-to-project.js [projectId]');
    return;
  }

  console.log(`🌱 Seeding cost codes to project: ${projectId}\n`);

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    console.error('❌ Project not found');
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
    { code: 'MAT-001', name: 'Steel Pipes', description: 'Carbon steel pipes for pipeline construction', category: 'MATERIAL', budget: 250000, wbsId: wbsNodes[0]?.id || null },
    { code: 'MAT-002', name: 'Valves & Fittings', description: 'Ball valves, gate valves, and pipe fittings', category: 'MATERIAL', budget: 150000, wbsId: wbsNodes[0]?.id || null },
    { code: 'MAT-003', name: 'Electrical Cables', description: 'Power and control cables', category: 'MATERIAL', budget: 180000, wbsId: null },
    { code: 'MAT-004', name: 'Instrumentation', description: 'Sensors, transmitters, and control devices', category: 'MATERIAL', budget: 120000, wbsId: null },
    { code: 'LAB-001', name: 'Welding Labor', description: 'Certified welders for pipe welding', category: 'LABOR', budget: 300000, wbsId: wbsNodes[1]?.id || null },
    { code: 'LAB-002', name: 'Electrical Installation', description: 'Electricians for cable installation and termination', category: 'LABOR', budget: 200000, wbsId: null },
    { code: 'LAB-003', name: 'Civil Works', description: 'Labor for foundation and structural work', category: 'LABOR', budget: 180000, wbsId: null },
    { code: 'EQP-001', name: 'Crane Rental', description: 'Mobile crane 50-ton capacity', category: 'EQUIPMENT', budget: 150000, wbsId: wbsNodes[2]?.id || null },
    { code: 'EQP-002', name: 'Welding Machines', description: 'TIG and MIG welding equipment', category: 'EQUIPMENT', budget: 80000, wbsId: null },
    { code: 'EQP-003', name: 'Testing Equipment', description: 'NDT and pressure testing equipment', category: 'EQUIPMENT', budget: 100000, wbsId: null },
    { code: 'SUB-001', name: 'Painting Subcontract', description: 'Surface preparation and painting works', category: 'SUBCONTRACT', budget: 120000, wbsId: null },
    { code: 'SUB-002', name: 'Insulation Works', description: 'Pipe and equipment insulation', category: 'SUBCONTRACT', budget: 90000, wbsId: null },
    { code: 'OVH-001', name: 'Project Management', description: 'PM office costs and staff', category: 'OVERHEAD', budget: 200000, wbsId: null },
    { code: 'OVH-002', name: 'Site Facilities', description: 'Site office, accommodation, and utilities', category: 'OVERHEAD', budget: 150000, wbsId: null },
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
      console.log(`✅ ${result.code} - ${result.name}`);
      created++;
    } catch (error) {
      console.log(`⚠️  ${costCode.code} - Already exists`);
    }
  }

  console.log(`\n✨ Created ${created} cost codes`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
