export default defineEventHandler(async (event) => {
  const path = event.path || "";

  if (event.method !== "GET" && path.startsWith("/api") && !path.startsWith("/api/auth")) {
    await requireUserSession(event);
  }

  if (path.startsWith("/api/admin/")) {
    await requireUserSession(event);
    const { user } = await getUserSession(event);

    if (user.role !== "admin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Acscess denied",
      });
    }
  }
});
