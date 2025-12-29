// Delete all cost codes for testing
// Usage: node scripts/delete-all-cost-codes.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting all cost codes...\n');

  // Get count before deletion
  const count = await prisma.costCode.count();
  console.log(`Found ${count} cost code(s)\n`);

  if (count === 0) {
    console.log('No cost codes to delete.');
    return;
  }

  // Delete all cost entries first (foreign key constraint)
  const deletedEntries = await prisma.costEntry.deleteMany({});
  console.log(`✅ Deleted ${deletedEntries.count} cost entries`);

  // Delete all cost codes
  const result = await prisma.costCode.deleteMany({});
  console.log(`✅ Deleted ${result.count} cost codes`);

  console.log('\n✨ All cost codes have been deleted');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
