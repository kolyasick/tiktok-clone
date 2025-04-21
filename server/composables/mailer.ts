import prisma from "~/lib/prisma";

export const mail = async (email: string, code: string) => {
  const { sendMail } = useNodeMailer();

 
  try {
    await sendMail({
      subject: "Account verify",
      text: `Your verification code is ${code}`,
      to: email,
    });
  } catch (e) {
    console.log(e);
  }

  return "OK";
};
