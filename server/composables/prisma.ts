import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

if (!prisma) {
  throw createError({
    statusCode: 500,
    statusMessage: "Error connecting to database",
  });
}

export default prisma