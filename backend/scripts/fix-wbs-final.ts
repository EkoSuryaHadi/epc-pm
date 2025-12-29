import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixWBSFinal() {
  console.log('🔧 Final WBS Structure Fix...\n');

  try {
    // Get the project with WBS issues
    const project = await prisma.project.findFirst({
      where: { code: 'PRJ-MH22UJKTCX6X' },
    });

    if (!project) {
      console.log('❌ Project not found!');
      return;
    }

    console.log(`📁 Project: ${project.name}\n`);

    // Get all WBS items
    const allWBS = await prisma.wBS.findMany({
      where: { projectId: project.id },
      orderBy: { code: 'asc' },
    });

    console.log('📊 Current Issues:');
    const rootItems = allWBS.filter((w) => !w.parentId);
    console.log(`   Root items: ${rootItems.length} (should be 3)`);
    rootItems.forEach((w) => {
      console.log(`   - ${w.code} ${w.name}`);
    });

    // Get parent nodes
    const proc2 = allWBS.find((w) => w.code === '2');
    const rotating21 = allWBS.find((w) => w.code === '2.1');
    const static212 = allWBS.find((w) => w.code === '2.1.2');
    const packages213 = allWBS.find((w) => w.code === '2.1.3');

    console.log('\n🔨 Applying Fixes:\n');

    // Fix 1: 2.1.2 Static Equipment -> should be child of 2.1
    if (static212 && rotating21) {
      console.log(`   1. Fixing ${static212.code} ${static212.name}`);
      console.log(`      Setting parent to: ${rotating21.code} ${rotating21.name}`);
      
      await prisma.wBS.update({
        where: { id: static212.id },
        data: {
          parentId: rotating21.id,
          level: 2,
          order: 2,
        },
      });
      console.log('      ✅ Fixed!\n');
    }

    // Fix 2: 2.1.3 Packages -> should be child of 2.1
    if (packages213 && rotating21) {
      console.log(`   2. Fixing ${packages213.code} ${packages213.name}`);
      console.log(`      Setting parent to: ${rotating21.code} ${rotating21.name}`);
      
      await prisma.wBS.update({
        where: { id: packages213.id },
        data: {
          parentId: rotating21.id,
          level: 2,
          order: 3,
        },
      });
      console.log('      ✅ Fixed!\n');
    }

    // Fix 3: Recalculate weightage for root level
    console.log('   3. Recalculating Root Level Weightage...');
    
    const finalRootItems = await prisma.wBS.findMany({
      where: { projectId: project.id, parentId: null },
    });

    console.log(`      Current root items: ${finalRootItems.length}`);
    
    if (finalRootItems.length === 3) {
      // Reset to original percentages proportionally
      const weightageMap: Record<string, number> = {
        '1': 30, // Engineering & Design
        '2': 20, // Procurement
        '3': 50, // Construction
      };

      const total = Object.values(weightageMap).reduce((a, b) => a + b, 0);
      
      for (const item of finalRootItems) {
        const targetWeight = weightageMap[item.code] || 0;
        const normalizedWeight = (targetWeight / total) * 100;
        
        await prisma.wBS.update({
          where: { id: item.id },
          data: { weightage: normalizedWeight },
        });
        
        console.log(`      ${item.code} ${item.name}: ${normalizedWeight.toFixed(2)}%`);
      }
      console.log('      ✅ Root weightage normalized to 100%\n');
    }

    // Fix 4: Fix children of 2.1 (Rotating Equipment) weightage
    console.log('   4. Fixing Children of 2.1 (Rotating Equipment)...');
    
    const children21 = await prisma.wBS.findMany({
      where: { parentId: rotating21?.id },
      orderBy: { code: 'asc' },
    });

    if (children21.length > 0) {
      const equalWeight = 100 / children21.length;
      
      for (const child of children21) {
        await prisma.wBS.update({
          where: { id: child.id },
          data: { weightage: equalWeight },
        });
        console.log(`      ${child.code} ${child.name}: ${equalWeight.toFixed(2)}%`);
      }
      console.log('      ✅ Children weightage balanced\n');
    }

    // Verification
    console.log('✅ Final Verification:\n');
    console.log('─'.repeat(70));

    const finalWBS = await prisma.wBS.findMany({
      where: { projectId: project.id },
      orderBy: { code: 'asc' },
    });

    const verifyRootItems = finalWBS.filter((w) => !w.parentId);
    const verifyRootTotal = verifyRootItems.reduce((sum, w) => sum + Number(w.weightage), 0);

    console.log('\n📊 Root Level Summary:');
    verifyRootItems.forEach((w) => {
      console.log(`   ✓ ${w.code.padEnd(6)} ${w.name.padEnd(30)} ${Number(w.weightage).toFixed(2)}%`);
    });
    console.log(`   ${'─'.repeat(45)}`);
    console.log(`   ${'TOTAL'.padEnd(37)} ${verifyRootTotal.toFixed(2)}%`);

    if (Math.abs(verifyRootTotal - 100) < 0.01) {
      console.log('\n   ✅ Root weightage is VALID (100%)');
    } else {
      console.log(`\n   ⚠️  Root weightage is ${verifyRootTotal.toFixed(2)}%`);
    }

    // Display full structure
    console.log('\n📂 Complete WBS Structure:\n');
    
    const displayTree = (nodes: typeof finalWBS, parentId: string | null = null, level = 0) => {
      const children = nodes.filter((n) => n.parentId === parentId);
      children.sort((a, b) => a.order - b.order);
      
      for (const node of children) {
        const indent = '  '.repeat(level);
        const weight = Number(node.weightage).toFixed(2);
        console.log(`${indent}${node.code} ${node.name} (${weight}%)`);
        displayTree(nodes, node.id, level + 1);
      }
    };

    displayTree(finalWBS, null);

    // Check for orphaned nodes
    const orphanedNodes = finalWBS.filter((w) => {
      if (!w.parentId) return false; // Root nodes are OK
      const hasParent = finalWBS.some((p) => p.id === w.parentId);
      return !hasParent;
    });

    if (orphanedNodes.length > 0) {
      console.log('\n⚠️  Orphaned Nodes (parent not found):');
      orphanedNodes.forEach((w) => {
        console.log(`   - ${w.code} ${w.name} (parentId: ${w.parentId})`);
      });
    } else {
      console.log('\n✅ No orphaned nodes');
    }

    // Check weightage for each parent
    console.log('\n📊 Weightage Validation by Parent:\n');
    
    const validateParentWeightage = (parentId: string | null, parentCode: string) => {
      const children = finalWBS.filter((w) => w.parentId === parentId);
      if (children.length === 0) return;
      
      const total = children.reduce((sum, w) => sum + Number(w.weightage), 0);
      const status = Math.abs(total - 100) < 0.01 ? '✅' : '⚠️';
      
      console.log(`   ${status} Children of ${parentCode}: ${total.toFixed(2)}% (${children.length} items)`);
    };

    validateParentWeightage(null, 'ROOT');
    const eng1 = finalWBS.find((w) => w.code === '1');
    const proc2Final = finalWBS.find((w) => w.code === '2');
    const eng12 = finalWBS.find((w) => w.code === '1.2');
    const rot21 = finalWBS.find((w) => w.code === '2.1');
    const mat22 = finalWBS.find((w) => w.code === '2.2');
    const con3 = finalWBS.find((w) => w.code === '3');

    if (eng1) validateParentWeightage(eng1.id, '1 (Engineering)');
    if (eng12) validateParentWeightage(eng12.id, '1.2 (Detail Engineering)');
    if (proc2Final) validateParentWeightage(proc2Final.id, '2 (Procurement)');
    if (rot21) validateParentWeightage(rot21.id, '2.1 (Rotating Equipment)');
    if (mat22) validateParentWeightage(mat22.id, '2.2 (Material Procurement)');
    if (con3) validateParentWeightage(con3.id, '3 (Construction)');

    console.log('\n✅ WBS Structure Fix Complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixWBSFinal().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
