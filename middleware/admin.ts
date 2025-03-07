export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, user } = useUserSession();

  if (!loggedIn.value || user.value?.role !== "admin") {
    return navigateTo("/");
  }

  if (to.path === "/admin" || to.path === "/admin/") {
    return navigateTo("/admin/dashboard");
  }
});
