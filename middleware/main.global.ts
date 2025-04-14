export default defineNuxtRouteMiddleware(async (to, from) => {
  const $videosStore = useVideosStore();

  if (to.path === "/" || to.path === "/en" || to.path === "/video") {
    await $videosStore.getVideos();
    console.log($videosStore.videos);
    return navigateTo(
      `${to.path.startsWith("/en") ? "/en/" : "/"}video/${$videosStore.videos[0]?.id}`
    );
  }
});
