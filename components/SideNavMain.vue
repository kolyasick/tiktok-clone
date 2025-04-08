<script setup lang="ts">
const { user } = useUserSession();
</script>

<template>
  <div
    id="SideNavMain"
    class="sticky top-0 left-0 z-20 bg-light dark:bg-dark pt-[70px] hidden sm:block -mt-[70px] h-screen lg:border-r-0 border-r border-gray-200 dark:border-[#ebebeb6c] lg:w-[310px] w-[75px]"
  >
    <div class="w-full mt-5">
      <NuxtLink to="/">
        <div class="w-full flex items-center py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#222222]">
          <div class="flex items-center lg:mx-0 mx-auto">
            <IconsHouse class="w-7 h-7 text-gray-900 dark:text-white" />
            <span class="lg:block text-[#F02C56] hidden pl-[9px] mt-0.5 font-semibold text-[17px]"> For You </span>
          </div>
        </div>
      </NuxtLink>

      <NuxtLink to="/">
        <div class="w-full flex items-center py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#222222]">
          <div class="flex items-center lg:mx-0 mx-auto">
            <IconsPeople class="w-7 h-7 text-gray-900 dark:text-white" />
            <span class="lg:block hidden pl-[9px] mt-0.5 font-semibold text-[17px] text-gray-900 dark:text-white"> Following </span>
          </div>
        </div>
      </NuxtLink>

      <NuxtLink to="/">
        <div class="w-full flex items-center py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#222222]">
          <div class="flex items-center lg:mx-0 mx-auto">
            <IconsCam class="w-7 h-7 text-gray-900 dark:text-white" />
            <span class="lg:block hidden pl-[9px] mt-0.5 font-semibold text-[17px] text-gray-900 dark:text-white"> Live </span>
          </div>
        </div>
      </NuxtLink>
      <NuxtLink v-if="user?.role === 'admin'" to="/admin/dashboard">
        <div class="w-full flex items-center py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#222222]">
          <div class="flex items-center lg:mx-0 mx-auto">
            <IconsAdmin class="w-7 h-7 text-gray-900 dark:text-white" />
            <span class="lg:block hidden pl-[9px] mt-0.5 font-semibold text-[17px] text-gray-900 dark:text-white"> For Admin </span>
          </div>
        </div>
      </NuxtLink>

      <div v-if="true">
        <div class="border-b border-gray-200 dark:border-[#ebebeb6c] mt-2" />

        <div class="lg:hidden block pt-3" />

        <button class="lg:block hidden text-[#F02C56] pt-1.5 text-[13px]">See more</button>
      </div>
      <div class="lg:block hidden border-b border-gray-200 dark:border-[#ebebeb6c] mt-2" />

      <div class="lg:block hidden text-[11px] text-gray-500">
        <div class="pt-4">About Newsroom Clipify Shop Contact Careers ByteDance</div>
        <div class="pt-4">Clipify for Good Advertise Developers Transparency Clipify Rewards Clipify Browse Clipify Embeds</div>
        <div class="pt-4">Help Safety Terms Privacy Creator Portal Community Guidelines</div>
        <div class="pt-4">© {{ new Date().getFullYear() }} Clipify</div>
      </div>

      <div class="pb-14"></div>
    </div>
  </div>
</template>

<style scoped></style>
