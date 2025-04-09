export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $videosStore } = useNuxtApp();

  if (to.path === "/") {
    await $videosStore.getVideos();
    return navigateTo(`/video/${$videosStore.videos[0]?.id}`);
  }
});
