import prisma from "~/server/composables/prisma"


export default defineEventHandler(async (event) => {
	const { id } = event.context.params as { id?: string };

    if (!id) {    
        throw createError({
            statusCode: 400,
            statusMessage: "Id parameter is required",
        });
    }    

    const parsedId = parseInt(id);
    
    const chat = await prisma.chat.findUnique({
        where: {
            id: parsedId,
        },
        include: {
            user1: true,
            user2: true,
            messages: {
                include: {
                    sender: true,
                },
            },
        },
    });

	return chat
})
