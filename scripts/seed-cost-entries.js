// Seed Cost Entries for Testing
// Usage: node scripts/seed-cost-entries.js [projectId]

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
    console.log('Usage: node scripts/seed-cost-entries.js [projectId]');
    return;
  }

  console.log('🌱 Seeding cost entries...\n');

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    console.error('❌ Project not found');
    return;
  }

  console.log(`📁 Project: ${project.name} (${project.code})\n`);

  // Get cost codes
  const costCodes = await prisma.costCode.findMany({
    where: { projectId: project.id },
    orderBy: { code: 'asc' }
  });

  if (costCodes.length === 0) {
    console.error('❌ No cost codes found. Please seed cost codes first.');
    return;
  }

  console.log(`Found ${costCodes.length} cost codes\n`);

  // Get first user
  const user = await prisma.user.findFirst();

  // Sample cost entries
  const now = new Date();
  const entries = [];

  // Budget entries (initial budget allocation)
  costCodes.forEach(costCode => {
    entries.push({
      projectId: project.id,
      costCodeId: costCode.id,
      description: `Initial budget allocation for ${costCode.name}`,
      amount: costCode.budget,
      entryDate: new Date(now.getFullYear(), now.getMonth() - 2, 1), // 2 months ago
      entryType: 'BUDGET',
      reference: `BUD-${costCode.code}`,
      createdById: user.id,
    });
  });

  // Actual expenses (randomly on some cost codes)
  const actualCostCodes = costCodes.filter(cc => ['MAT-001', 'MAT-002', 'LAB-001', 'LAB-002', 'EQP-001'].includes(cc.code));
  actualCostCodes.forEach((costCode, idx) => {
    // Add a few actual transactions
    const numTransactions = Math.floor(Math.random() * 3) + 1; // 1-3 transactions
    
    for (let i = 0; i < numTransactions; i++) {
      const amount = Number(costCode.budget) * (0.1 + Math.random() * 0.3); // 10-40% of budget
      const daysAgo = Math.floor(Math.random() * 30) + 1; // 1-30 days ago
      
      entries.push({
        projectId: project.id,
        costCodeId: costCode.id,
        description: `${['Purchase order', 'Invoice payment', 'Material delivery', 'Service payment'][i % 4]} for ${costCode.name}`,
        amount: Math.round(amount * 100) / 100,
        entryDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo),
        entryType: 'ACTUAL',
        reference: `INV-${costCode.code}-${String(i + 1).padStart(3, '0')}`,
        createdById: user.id,
      });
    }
  });

  // Commitments (purchase orders not yet invoiced)
  const commitmentCostCodes = costCodes.filter(cc => ['MAT-003', 'SUB-001', 'EQP-002'].includes(cc.code));
  commitmentCostCodes.forEach((costCode, idx) => {
    const amount = Number(costCode.budget) * (0.3 + Math.random() * 0.2); // 30-50% of budget
    
    entries.push({
      projectId: project.id,
      costCodeId: costCode.id,
      description: `Purchase order commitment for ${costCode.name}`,
      amount: Math.round(amount * 100) / 100,
      entryDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15),
      entryType: 'COMMITMENT',
      reference: `PO-${costCode.code}-001`,
      createdById: user.id,
    });
  });

  // Forecasts (expected future costs)
  const forecastCostCodes = costCodes.filter(cc => ['LAB-003', 'OVH-001', 'SUB-002'].includes(cc.code));
  forecastCostCodes.forEach((costCode, idx) => {
    const amount = Number(costCode.budget) * 0.9; // 90% of budget
    
    entries.push({
      projectId: project.id,
      costCodeId: costCode.id,
      description: `Forecast estimate for ${costCode.name}`,
      amount: Math.round(amount * 100) / 100,
      entryDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15),
      entryType: 'FORECAST',
      reference: null,
      createdById: user.id,
    });
  });

  console.log('Creating cost entries...\n');

  let created = 0;
  for (const entry of entries) {
    try {
      await prisma.costEntry.create({
        data: entry,
      });
      created++;
      console.log(`✅ ${entry.entryType.padEnd(10)} ${entry.reference || '(no ref)'.padEnd(15)} $${entry.amount.toLocaleString()}`);
    } catch (error) {
      console.log(`⚠️  Failed to create entry`);
    }
  }

  console.log(`\n✨ Created ${created} cost entries`);

  // Show summary by type
  const allEntries = await prisma.costEntry.findMany({
    where: { projectId: project.id },
  });

  const summary = allEntries.reduce((acc, entry) => {
    acc[entry.entryType] = (acc[entry.entryType] || 0) + Number(entry.amount);
    return acc;
  }, {});

  console.log('\n📊 Summary by Type:');
  Object.entries(summary).forEach(([type, amount]) => {
    console.log(`   ${type.padEnd(15)} $${amount.toLocaleString()}`);
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
