<template>
  <div
    id="SideNavMain"
    class="sticky top-0 left-0 z-20 bg-[#121212] pt-[70px] hidden sm:block -mt-[70px] h-screen lg:border-r-0 border-r border-[#ebebeb6c] lg:w-[310px] w-[75px]"
  >
    <div class="w-full w-[55px]">
      <NuxtLink to="/">
        <MenuItem iconString="For You" colorString="#F02C56" sizeString="30" />
      </NuxtLink>
      <MenuItem iconString="Following" colorString="#000000" sizeString="27" />
      <MenuItem iconString="LIVE" colorString="#000000" sizeString="27" />

      <div v-if="true">
        <div class="border-b border-[#ebebeb6c] lg:ml-2 mt-2" />

        <div class="lg:hidden block pt-3" />

        <button class="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px]">See more</button>
      </div>
      <div class="lg:block hidden border-b border-[#ebebeb6c] lg:ml-2 mt-2" />

      <div class="lg:block hidden text-[11px] text-gray-500">
        <div class="pt-4 px-2">About Newsroom TikTok Shop Contact Careers ByteDance</div>
        <div class="pt-4 px-2">TikTok for Good Advertise Developers Transparency TikTok Rewards TikTok Browse TikTok Embeds</div>
        <div class="pt-4 px-2">Help Safety Terms Privacy Creator Portal Community Guidelines</div>
        <div class="pt-4 px-2">© {{ new Date().getFullYear() }} TikTok</div>
      </div>

      <div class="pb-14"></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
