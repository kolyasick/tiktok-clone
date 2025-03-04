<template>
  <TopNav />
  <div class="wrapper container bg-[#121212] flex justify-between sm:gap-3 lg:gap-20 sm:pl-0 lg:pl-[16px]">
    <div>
      <SideNavMain />
    </div>
    <slot />
  </div>
</template>

<script setup>
const route = useRoute();
</script>

<style scoped>
@media (max-width: 1000px) {
  .wrapper {
    /* margin-left: -1rem; */
  }
}
</style>
