import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [{ title: "admin" }, { title: "user" }],
  });

  await prisma.status.createMany({
    data: [{ title: "new" }, { title: "published" }, { title: "blocked" }],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
