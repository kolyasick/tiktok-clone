import { User } from "@prisma/client";
import prisma from "~/lib/prisma";
import { v4 as uuid } from "uuid";

export const mail = async (user: User) => {
  const r = useRuntimeConfig();
  const { sendMail } = useNodeMailer();
  const link = uuid();
  const activationLink = await prisma.activationLink.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!activationLink) {
    await prisma.activationLink.create({
      data: {
        userId: user.id,
        link,
      },
    });
  }
  await sendMail({
    subject: "Account verify",
    text: `Follow the link to verify your account ${r.public.appUrl}/api/auth/verify/${link}`,
    to: user.email,
  });

  return "Follow the link on your email to verify account";
};
