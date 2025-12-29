import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixWBSStructure() {
  console.log('🔧 Starting WBS Structure Fix...\n');

  try {
    // Step 1: Get all projects
    const projects = await prisma.project.findMany({
      select: { id: true, code: true, name: true },
    });

    if (projects.length === 0) {
      console.log('❌ No projects found!');
      return;
    }

    console.log(`📁 Found ${projects.length} project(s):`);
    projects.forEach((p, i) => console.log(`   ${i + 1}. ${p.code} - ${p.name}`));
    console.log();

    // Process each project
    for (const project of projects) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🏗️  Processing Project: ${project.name} (${project.code})`);
      console.log('='.repeat(60));

      await fixProjectWBS(project.id);
    }

    console.log('\n✅ WBS Structure Fix Completed!\n');
  } catch (error) {
    console.error('❌ Error fixing WBS structure:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function fixProjectWBS(projectId: string) {
  // Step 1: Get all WBS items
  const allWBS = await prisma.wBS.findMany({
    where: { projectId },
    orderBy: { code: 'asc' },
  });

  if (allWBS.length === 0) {
    console.log('   ℹ️  No WBS items found for this project\n');
    return;
  }

  console.log(`\n📊 Current Structure (${allWBS.length} items):`);
  console.log('─'.repeat(60));
  allWBS.forEach((wbs) => {
    const parentInfo = wbs.parentId ? '(has parent)' : '(ROOT)';
    console.log(
      `   ${wbs.code.padEnd(10)} ${wbs.name.padEnd(30)} ${String(wbs.weightage).padEnd(6)}% ${parentInfo}`
    );
  });

  // Step 2: Identify root level items (should only be '1', '2', '3')
  const rootItems = allWBS.filter((w) => !w.parentId);
  console.log(`\n🌲 Root Level Items (${rootItems.length}):`);
  const rootTotal = rootItems.reduce((sum, w) => sum + Number(w.weightage), 0);
  console.log(`   Total Weightage: ${rootTotal.toFixed(2)}%`);
  rootItems.forEach((w) => console.log(`   - ${w.code} ${w.name} (${w.weightage}%)`));

  if (Math.abs(rootTotal - 100) > 0.01) {
    console.log(`   ⚠️  WARNING: Root weightage is ${rootTotal.toFixed(2)}%, should be 100%`);
  }

  // Step 3: Fix parent-child relationships
  console.log('\n🔨 Fixing Parent-Child Relationships...');

  // Fix "2.2 Material Procurement" -> should be child of "2"
  const materialProc = allWBS.find((w) => w.code === '2.2');
  const procurementParent = allWBS.find((w) => w.code === '2');

  if (materialProc && procurementParent && !materialProc.parentId) {
    console.log(`   ✓ Fixing: ${materialProc.code} ${materialProc.name} -> parent: ${procurementParent.code}`);
    await prisma.wBS.update({
      where: { id: materialProc.id },
      data: { parentId: procurementParent.id, level: 1 },
    });
  }

  // Fix "2.1.1 Rotating Equipment" -> rename to "2.1" and make child of "2"
  const rotatingEquip = allWBS.find((w) => w.code === '2.1.1');
  if (rotatingEquip && procurementParent) {
    console.log(`   ✓ Fixing: ${rotatingEquip.code} -> 2.1 (parent: ${procurementParent.code})`);
    await prisma.wBS.update({
      where: { id: rotatingEquip.id },
      data: {
        code: '2.1',
        parentId: procurementParent.id,
        level: 1,
        order: 1,
      },
    });
  }

  // Fix children of "2.2" (Piping, Electrical, Instrumentation, Static)
  const materialProcRefresh = await prisma.wBS.findFirst({
    where: { code: '2.2', projectId },
  });

  if (materialProcRefresh) {
    const childCodes = ['2.2.1', '2.2.2', '2.2.3', '2.2.4'];
    for (const code of childCodes) {
      const child = allWBS.find((w) => w.code === code && w.name !== 'Packages');
      if (child && child.parentId !== materialProcRefresh.id) {
        console.log(`   ✓ Fixing: ${child.code} ${child.name} -> parent: ${materialProcRefresh.code}`);
        await prisma.wBS.update({
          where: { id: child.id },
          data: { parentId: materialProcRefresh.id, level: 2 },
        });
      }
    }
  }

  // Step 4: Fix duplicate code "2.2.3" (Packages -> 2.3)
  const packagesNode = allWBS.find((w) => w.code === '2.2.3' && w.name === 'Packages');
  if (packagesNode && procurementParent) {
    console.log(`   ✓ Fixing: ${packagesNode.code} Packages -> 2.3 (removing duplicate code)`);
    await prisma.wBS.update({
      where: { id: packagesNode.id },
      data: {
        code: '2.3',
        parentId: procurementParent.id,
        level: 1,
        order: 3,
      },
    });
  }

  // Step 5: Fix order fields
  console.log('\n📋 Fixing Order Fields...');

  // Root level order
  const rootOrderMap: { [key: string]: number } = {
    '1': 1,
    '2': 2,
    '3': 3,
  };

  for (const [code, order] of Object.entries(rootOrderMap)) {
    const node = allWBS.find((w) => w.code === code);
    if (node) {
      await prisma.wBS.update({
        where: { id: node.id },
        data: { order },
      });
      console.log(`   ✓ Set order ${order} for: ${code}`);
    }
  }

  // Children of "2" order
  const procChildren = await prisma.wBS.findMany({
    where: { parentId: procurementParent?.id },
  });

  const childOrderMap: { [key: string]: number } = {
    '2.1': 1,
    '2.2': 2,
    '2.3': 3,
  };

  for (const [code, order] of Object.entries(childOrderMap)) {
    const child = procChildren.find((c) => c.code === code);
    if (child) {
      await prisma.wBS.update({
        where: { id: child.id },
        data: { order },
      });
      console.log(`   ✓ Set order ${order} for: ${code}`);
    }
  }

  // Step 6: Fix weightage
  console.log('\n⚖️  Fixing Weightage...');

  // Get fresh root items
  const currentRootItems = await prisma.wBS.findMany({
    where: { projectId, parentId: null },
  });

  const currentRootTotal = currentRootItems.reduce((sum, w) => sum + Number(w.weightage), 0);

  if (Math.abs(currentRootTotal - 100) > 0.01) {
    console.log(`   Current root total: ${currentRootTotal.toFixed(2)}%`);
    console.log('   Adjusting to 100% proportionally...');

    // Proportional adjustment
    for (const item of currentRootItems) {
      const newWeightage = (Number(item.weightage) / currentRootTotal) * 100;
      await prisma.wBS.update({
        where: { id: item.id },
        data: { weightage: newWeightage },
      });
      console.log(`   ✓ ${item.code}: ${item.weightage}% -> ${newWeightage.toFixed(2)}%`);
    }
  }

  // Fix children of "2.2" (Material Procurement) - should total 100%
  const materialProc2 = await prisma.wBS.findFirst({
    where: { code: '2.2', projectId },
  });

  if (materialProc2) {
    const materialChildren = await prisma.wBS.findMany({
      where: { parentId: materialProc2.id },
    });

    const childTotal = materialChildren.reduce((sum, w) => sum + Number(w.weightage), 0);

    if (Math.abs(childTotal - 100) > 0.01) {
      console.log(`\n   Children of 2.2: Current total ${childTotal.toFixed(2)}%`);
      console.log('   Adjusting to 100% (25% each)...');

      for (const child of materialChildren) {
        await prisma.wBS.update({
          where: { id: child.id },
          data: { weightage: 25 },
        });
        console.log(`   ✓ ${child.code}: 25%`);
      }
    }
  }

  // Step 7: Verification
  console.log('\n✅ Verification:');
  console.log('─'.repeat(60));

  const finalWBS = await prisma.wBS.findMany({
    where: { projectId },
    orderBy: { code: 'asc' },
  });

  const finalRootItems = finalWBS.filter((w) => !w.parentId);
  const finalRootTotal = finalRootItems.reduce((sum, w) => sum + Number(w.weightage), 0);

  console.log(`\n   Root Level (${finalRootItems.length} items):`);
  finalRootItems.forEach((w) => {
    console.log(`   - ${w.code} ${w.name}: ${Number(w.weightage).toFixed(2)}%`);
  });
  console.log(`   Total: ${finalRootTotal.toFixed(2)}%`);

  if (Math.abs(finalRootTotal - 100) < 0.01) {
    console.log('   ✅ Root weightage is VALID (100%)');
  } else {
    console.log(`   ⚠️  Root weightage is ${finalRootTotal.toFixed(2)}% (should be 100%)`);
  }

  // Check for duplicate codes
  const codeCounts = finalWBS.reduce((acc, wbs) => {
    acc[wbs.code] = (acc[wbs.code] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const duplicates = Object.entries(codeCounts).filter(([_, count]: [string, number]) => count > 1);
  if (duplicates.length > 0) {
    console.log('\n   ⚠️  Duplicate codes found:');
    duplicates.forEach(([code, count]) => console.log(`      - ${code}: ${count} occurrences`));
  } else {
    console.log('\n   ✅ No duplicate codes');
  }

  console.log('\n   Final Structure:');
  finalWBS.forEach((w) => {
    const indent = '   ' + '  '.repeat(w.level);
    const parentInfo = w.parentId ? '' : '[ROOT]';
    console.log(`${indent}${w.code} ${w.name} (${Number(w.weightage).toFixed(2)}%) ${parentInfo}`);
  });
}

// Run the fix
fixWBSStructure()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
