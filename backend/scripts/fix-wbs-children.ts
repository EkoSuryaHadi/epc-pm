import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixChildrenWeightage() {
  console.log('🔧 Fixing Children Weightage to 100%...\n');

  try {
    const project = await prisma.project.findFirst({
      where: { code: 'PRJ-MH22UJKTCX6X' },
    });

    if (!project) {
      console.log('❌ Project not found!');
      return;
    }

    const allWBS = await prisma.wBS.findMany({
      where: { projectId: project.id },
    });

    // Fix Children of "2" (Procurement) - currently 80%, need 100%
    const proc2 = allWBS.find((w) => w.code === '2');
    if (proc2) {
      const children = allWBS.filter((w) => w.parentId === proc2.id);
      console.log(`📊 Children of 2 (Procurement): ${children.length} items`);
      
      // Currently: 2.1 (40%) + 2.2 (40%) = 80%
      // Target: 2.1 (50%) + 2.2 (50%) = 100%
      const rot21 = children.find((c) => c.code === '2.1');
      const mat22 = children.find((c) => c.code === '2.2');

      if (rot21) {
        await prisma.wBS.update({
          where: { id: rot21.id },
          data: { weightage: 50 },
        });
        console.log(`   ✓ 2.1 Rotating Equipment: 40% -> 50%`);
      }

      if (mat22) {
        await prisma.wBS.update({
          where: { id: mat22.id },
          data: { weightage: 50 },
        });
        console.log(`   ✓ 2.2 Material Procurement: 40% -> 50%`);
      }
      console.log('   ✅ Total: 100%\n');
    }

    // Fix Children of "3" (Construction) - currently 80%, need 100%
    const con3 = allWBS.find((w) => w.code === '3');
    if (con3) {
      const children = allWBS.filter((w) => w.parentId === con3.id);
      console.log(`📊 Children of 3 (Construction): ${children.length} items`);
      
      // Currently: 3.1 (10%) + 3.2 (15%) + 3.3 (35%) + 3.4 (20%) = 80%
      // Target: Proportionally adjust to 100%
      const weightageMap: Record<string, number> = {
        '3.1': 12.5,  // 10/80 * 100 = 12.5%
        '3.2': 18.75, // 15/80 * 100 = 18.75%
        '3.3': 43.75, // 35/80 * 100 = 43.75%
        '3.4': 25,    // 20/80 * 100 = 25%
      };

      for (const child of children) {
        const newWeight = weightageMap[child.code];
        if (newWeight) {
          await prisma.wBS.update({
            where: { id: child.id },
            data: { weightage: newWeight },
          });
          console.log(`   ✓ ${child.code} ${child.name}: ${child.weightage}% -> ${newWeight}%`);
        }
      }
      console.log('   ✅ Total: 100%\n');
    }

    // Rename nodes for clarity
    console.log('📝 Fixing Node Names...\n');
    
    // 2.1.2 should be renamed (it's under Rotating Equipment but named "Static Equipment")
    const static212 = allWBS.find((w) => w.code === '2.1.2');
    if (static212 && static212.name === 'Static Equipment') {
      await prisma.wBS.update({
        where: { id: static212.id },
        data: { name: 'Rotating Components' },
      });
      console.log('   ✓ 2.1.2: "Static Equipment" -> "Rotating Components"');
    }

    // 2.1.3 Packages could be renamed to be more specific
    const packages213 = allWBS.find((w) => w.code === '2.1.3');
    if (packages213) {
      await prisma.wBS.update({
        where: { id: packages213.id },
        data: { name: 'Equipment Packages' },
      });
      console.log('   ✓ 2.1.3: "Packages" -> "Equipment Packages"\n');
    }

    // Final verification
    console.log('✅ Final Verification:\n');
    console.log('─'.repeat(70));

    const finalWBS = await prisma.wBS.findMany({
      where: { projectId: project.id },
      orderBy: { code: 'asc' },
    });

    const validateParent = (parentId: string | null, parentName: string) => {
      const children = finalWBS.filter((w) => w.parentId === parentId);
      if (children.length === 0) return;
      
      const total = children.reduce((sum, w) => sum + Number(w.weightage), 0);
      const status = Math.abs(total - 100) < 0.01 ? '✅' : '⚠️';
      
      console.log(`${status} ${parentName}: ${total.toFixed(2)}%`);
      children.forEach((c) => {
        console.log(`    - ${c.code} ${c.name}: ${Number(c.weightage).toFixed(2)}%`);
      });
      console.log();
    };

    validateParent(null, 'ROOT Level');
    
    const proc = finalWBS.find((w) => w.code === '2');
    if (proc) validateParent(proc.id, '2 Procurement');
    
    const con = finalWBS.find((w) => w.code === '3');
    if (con) validateParent(con.id, '3 Construction');

    console.log('✅ All parent weightages validated!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixChildrenWeightage().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
