import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [{ title: "admin" }, { title: "user" }],
  });

  await prisma.status.createMany({
    data: [{ title: "new" }, { title: "published" }, { title: "blocked" }],
  });
  // await prisma.like.deleteMany();

  // await prisma.commentLike.deleteMany()
  //  await prisma.comment.deleteMany()

  // await prisma.comment.createMany({
  //   data: Array.from({ length: 100000 }, () => {
  //     return {
  //       text: "asd",
  //       videoId: "a73f9c3e-fd53-4dac-afa7-bfd7c5c301e7",
  //       profileId: 1,
  //     };
  //   }),
  // });

  // await prisma.like.deleteMany()
  // await prisma.commentLike.deleteMany()
  // await prisma.comment.deleteMany()
  // await prisma.video.deleteMany()
  // await prisma.follows.deleteMany()
  // await prisma.block.deleteMany()
  // await prisma.message.deleteMany()
  // await prisma.chat.deleteMany()
  // await prisma.profile.deleteMany()
  // await prisma.user.deleteMany()
  // console.log(await prisma.activationCode.findMany())
  // await prisma.user.update({
  //   where: {
  //     email: "kolya@mail.ru",
  //   },
  //   data: {
  //     role: {
  //       connect: {
  //         title: "admin",
  //       },
  //     },
  //   },
  // });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
