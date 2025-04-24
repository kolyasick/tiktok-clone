<template>
  <div>
    <TopNav />
    <div class="wrapper bg-light dark:bg-dark flex justify-center">
      <SideNavMain />

      <slot />
    </div>
  </div>
</template>
<style scoped>
::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
* {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
