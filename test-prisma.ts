import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const parents = await prisma.parent.findMany();
    const events = await prisma.event.findMany();
    
    console.log("Parents:", parents.length);
    console.log("Events:", events.length);

    await prisma.archive.create({
      data: {
        yearName: "TEST_YEAR_" + Date.now(),
        data: JSON.stringify({ parents, events })
      }
    });
    console.log("Archive created successfully.");
  } catch (error) {
    console.error("Prisma Error:", error);
  } finally {
    await prisma.$disconnect()
  }
}

main()
