import { PrismaClient } from '@prisma/client';
import { runDatabaseSeed } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  const counts = await runDatabaseSeed(prisma);
  console.log('Seed complete:', counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
