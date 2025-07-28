<template>
  <aside
    class="w-80 border-r border-zinc-300 flex flex-col justify-between bg-gray-100"
  >
    <div v-if="loadingRooms" class="text-sm text-zinc-950 p-2">
      Loading rooms...
    </div>
    <div v-if="error" class="text-sm text-red-500 p-2">{{ error }}</div>

    <div
      v-if="acceptedChatRooms.length"
      class="text-sm w-full text-zinc-950 border-zinc-300 border-b-2 pl-4 pb-4 pt-4 pr-2"
    >
      <div class="flex justify-between items-center w-full">
        <div class="flex text-lg font-semibold">
          <div class="pr-2">
            <MessageCircle />
          </div>
          Chats
        </div>
      </div>
    </div>

    <div
      class="flex-1 overflow-hidden hover:overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-transparent"
    >
      <div
        class="flex justify-between text-md text-zinc-950 pt-4 pl-4 pr-2 font-semibold"
      >
        <span>CHANNELS</span>
        <Plus
          @click="handleCreateRoom"
          class="cursor-pointer hover:bg-zinc-100 rounded-md text-zinc-950 w-5 h-5"
        />
      </div>

      <div class="overflow-y-auto">
        <table
          v-if="acceptedChatRooms.length"
          class="w-full mb-4 pl-2 pr-2"
          style="border-collapse: separate; border-spacing: 0 0.5rem"
        >
          <tbody>
            <tr
              v-for="room in acceptedChatRooms"
              :key="room.id"
              class="group"
              @click="handleRoomClick(room)"
            >
              <td
                :class="[
                  'p-2 flex justify-between items-center cursor-pointer min-h-8 rounded-lg',
                  selectedRoom?.id === room.id
                    ? 'bg-zinc-950 text-white'
                    : 'hover:bg-zinc-200 text-zinc-600',
                ]"
              >
                <div class="flex items-center text-base">
                  <Hash class="pr-2" />
                  <span>{{ room.name }}</span>
                </div>

                <button
                  @click.stop="handleClickInvite(room)"
                  class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-transparent border-none p-0"
                >
                  <UserPlus class="w-6 h-6" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="pt-2 pb-2 pl-2 pr-2 border-t-2 border-zinc-300">
      <div
        @click="onClickSettingsDialogOpen"
        class="flex items-center text-md text-zinc-950 pl-4 pr-4 py-2 hover:bg-zinc-200 rounded-lg cursor-pointer"
      >
        <Settings class="pr-2 w-6 h-6" />
        Settings
      </div>
    </div>
    <div class="pb-2 pl-2 pr-2 border-zinc-300">
      <div
        @click="openLogoutDialog"
        class="flex items-center text-md text-zinc-950 pl-4 pr-4 py-2 hover:bg-zinc-200 rounded-lg cursor-pointer"
      >
        <Logout class="pr-2 w-6 h-6" />
        Logout
      </div>
    </div>
  </aside>

  <Dialog v-model="isLogoutDialogOpen">
    <template #header>
      <div class="flex"><Logout class="pr-2" />Log out</div>
    </template>

    <div class="flex flex-col gap-2">Are you sure you want to logout?</div>

    <div class="flex gap-4">
      <button
        @click="() => (isLogoutDialogOpen = false)"
        class="w-full text-zinc-950 mt-4 bg-slate-200 text-white py-1 px-4 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg"
      >
        Cancel
      </button>
      <button
        @click="logout()"
        class="w-full mt-4 bg-zinc-700 text-white py-1 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg"
      >
        Logout
      </button>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from "vue";
import { logout } from "@/utils/auth";
import Dialog from "./Dialog.vue";
const props = defineProps([
  "loadingRooms",
  "acceptedChatRooms",
  "selectedRoom",
  "error",
]);

const emit = defineEmits([
  "select-room",
  "open-create-room",
  "invite-room",
  "settings-clicked",
]);

const isLogoutDialogOpen = ref(false);

function openLogoutDialog() {
  isLogoutDialogOpen.value = true;
}

function onClickSettingsDialogOpen() {
  emit("settings-clicked");
}

function handleRoomClick(room) {
  emit("select-room", room);
}

function handleCreateRoom() {
  emit("open-create-room");
}

function handleClickInvite(room) {
  emit("invite-room", room);
}
</script>
@
