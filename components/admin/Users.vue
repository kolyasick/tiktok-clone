<script setup lang="ts">
const { $adminStore } = useNuxtApp();

</script>

<template>
  <div id="last-users">
    <h1 class="font-bold py-4 uppercase">Last 24h users</h1>
    <div class="">
      <table class="w-full whitespace-nowrap">
        <thead class="bg-black/60">
          <tr>
            <th class="text-left py-3 px-2 rounded-l-lg">Name</th>
            <th class="text-left py-3 px-2">Email</th>
            <th class="text-left py-3 px-2">Status</th>
            <th class="text-left py-3 px-2">Sign-up</th>
            <th class="text-left py-3 px-2 rounded-r-lg">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in $adminStore.users" :key="user.id" class="border-b border-gray-700">
            <td class="py-3 px-2 font-bold">
              <div class="inline-flex space-x-3 items-center">
                <span>
                  <img class="rounded-full w-8 h-8" :src="'/upload/avatars/' + user.avatar" :alt="user.name" />
                </span>
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td class="py-3 px-2">{{ user.user.email }}</td>
            <td class="py-3 px-2">{{ user.online ? "Online" : "Offline" }}</td>
            <td class="py-3 px-2">{{ formatDate(user.user.createdAt) }}</td>
            <td class="py-3 px-2">
              <div class="inline-flex items-center space-x-3">
                <a href="" title="Edit" class="hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                </a>
                <a href="" title="Edit password" class="hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </a>
                <a href="" title="Suspend user" class="hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
