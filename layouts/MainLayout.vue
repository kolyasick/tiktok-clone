<template>
  <div>
    <TopNav />
    <div class="wrapper container bg-light dark:bg-dark flex justify-between sm:gap-3 lg:gap-20 sm:pl-0 lg:pl-[16px]">
      <SideNavMain />
      <slot />
    </div>
  </div>
</template>
