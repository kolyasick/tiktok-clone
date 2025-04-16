export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    console.log('middleware redirect to /')
    return navigateTo("/");
  }
});
