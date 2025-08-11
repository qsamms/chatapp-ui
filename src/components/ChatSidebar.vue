<template>
  <div
    class="flex h-screen"
    @mouseenter="() => setIsHovering(true)"
    @mouseleave="() => setIsHovering(false)"
  >
    <aside
      :class="[
        'transition-all duration-300 border-r border-zinc-300 bg-gray-100 flex flex-col justify-between relative',
        isCollapsed ? 'w-10' : 'w-80',
      ]"
    >
      <button
        v-if="isHovering"
        @click="isCollapsed = !isCollapsed"
        class="absolute top-4 right-0 translate-x-1/2 z-10 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-full p-1 shadow"
      >
        <ChevronLeft v-if="!isCollapsed" class="w-4 h-4" />
        <ChevronRight v-else class="w-4 h-4" />
      </button>

      <div
        v-if="!isCollapsed"
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
        v-if="!isCollapsed"
        class="flex-1 overflow-hidden hover:overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-transparent"
      >
        <div
          class="flex justify-between text-md text-zinc-950 pt-4 pl-4 pr-2 font-semibold"
        >
          <span>CHANNELS</span>
          <Plus
            @click="handleCreateRoom"
            class="cursor-pointer hover:bg-zinc-200 rounded-md text-zinc-950 w-5 h-5"
          />
        </div>
        <div class="flex">
          <Autocomplete
            v-model="searchText"
            :suggestions="filteredChatRooms"
            @complete="searchChatRooms"
            @option-select="handleAutocompleteRoomClick"
            optionLabel="name"
            placeholder="Search Channels..."
            class="mx-2 border border-zinc-950 rounded-lg p-2 mt-2 text-zinc-600 w-full"
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
                    'p-2 flex justify-between items-center cursor-pointer max-h-10 rounded-lg',
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

        <div
          class="flex justify-between text-md text-zinc-950 pt-4 pl-4 pr-2 font-semibold"
        >
          <span>DIRECT MESSAGES</span>
          <Plus
            @click="handleCreateDM"
            class="cursor-pointer hover:bg-zinc-200 rounded-md text-zinc-950 w-5 h-5"
          />
        </div>

        <div class="overflow-y-auto">
          <table
            v-if="dms.length"
            class="w-full mb-4 pl-2 pr-2"
            style="border-collapse: separate; border-spacing: 0 0.5rem"
          >
            <tbody>
              <tr
                v-for="room in dms"
                :key="room.id"
                class="group"
                @click="handleRoomClick(room)"
              >
                <td
                  :class="[
                    'p-2 flex justify-between items-center cursor-pointer max-h-10 rounded-lg',
                    selectedRoom?.id === room.id
                      ? 'bg-zinc-950 text-white'
                      : 'hover:bg-zinc-200 text-zinc-600',
                  ]"
                >
                  <div class="flex items-center text-base">
                    <User class="pr-2"></User>
                    <div class="flex items-center">
                      <div v-if="room.otherParticipant.displayName">
                        {{ room.otherParticipant.displayName }}
                      </div>
                      <div v-else>
                        {{ room.otherParticipant.firstName }}
                        {{ room.otherParticipant.lastName }}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex flex-col gap-2 p-2">
        <div v-if="!isCollapsed" class="pt-2 border-t-2 border-zinc-300">
          <div
            @click="onClickFriendsDialogOpen"
            class="flex items-center text-md text-zinc-950 pl-4 pr-4 py-2 hover:bg-zinc-200 rounded-lg cursor-pointer"
          >
            <Heart class="pr-2 w-6 h-6" />
            Friends
          </div>
        </div>
        <div v-if="!isCollapsed">
          <div
            @click="onClickSettingsDialogOpen"
            class="flex items-center text-md text-zinc-950 pl-4 pr-4 py-2 hover:bg-zinc-200 rounded-lg cursor-pointer"
          >
            <Settings class="pr-2 w-6 h-6" />
            Settings
          </div>
        </div>
        <div v-if="!isCollapsed">
          <div
            @click="openLogoutDialog"
            class="flex items-center text-md text-zinc-950 pl-4 pr-4 py-2 hover:bg-zinc-200 rounded-lg cursor-pointer"
          >
            <Logout class="pr-2 w-6 h-6" />
            Logout
          </div>
        </div>
      </div>
    </aside>
  </div>

  <BaseDialog v-model="friendsDialogOpen">
    <template #header>
      <div class="flex"><Heart class="pr-2" />Friends</div>
    </template>

    <div v-for="friend in friends">
      <div>friend</div>
    </div>

    <div v-for="friend in friendRequests">
      <div>friend</div>
    </div>
  </BaseDialog>

  <BaseDialog v-model="settingsDialogOpen">
    <template #header>
      <div class="flex"><Settings class="pr-2" />Settings</div>
    </template>

    <div class="flex flex-col gap-2">
      <div>
        <div class="flex items-center align-center">
          <div
            class="flex ml-2 mt-2 text-zinc-800 flex bg-slate-200 w-10 h-10 rounded-full items-center justify-center"
          >
            <div class="text-lg uppercase">
              {{ currentUser.firstName[0] }}{{ currentUser.lastName[0] }}
            </div>
          </div>
          <div class="pl-2 text-lg">
            {{ currentUser.firstName }} {{ currentUser.lastName }}
          </div>
        </div>
        <div class="pl-2 text-md pt-4 text-zinc-500">
          {{ currentUser.email }}
        </div>
      </div>

      <div class="flex flex-col pt-4">
        <label class="pb-2">Display Name</label>
        <input
          v-model="currentUser.displayName"
          class="flex-1 p-3 border text-zinc-950 border-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
        />
      </div>

      <div class="flex flex-col pt-2">
        <label class="pb-2">Bio</label>
        <textarea
          v-model="currentUser.bio"
          class="flex-1 p-3 border text-zinc-950 border-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
        ></textarea>
      </div>
    </div>

    <button
      @click="handleClickSaveProfile"
      class="w-full mt-4 bg-zinc-700 text-white py-1 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg"
    >
      Save Profile
    </button>
  </BaseDialog>

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
import { useHeartbeat } from "@/utils/useHeartbeat";
import { updateUser, getFriends } from "@/utils/api";
import BaseDialog from "./Dialog.vue";

const props = defineProps([
  "loadingRooms",
  "acceptedChatRooms",
  "dms",
  "selectedRoom",
  "error",
  "currentUser",
]);

console.log("currentUser");

const emit = defineEmits([
  "select-room",
  "open-create-room",
  "invite-room",
  "settings-clicked",
  "open-create-dm",
]);

useHeartbeat();
const searchText = ref("");
const isLogoutDialogOpen = ref(false);
const isHovering = ref(false);
const isCollapsed = ref(false);
const filteredChatRooms = ref([]);
const settingsDialogOpen = ref(false);

const friendsDialogOpen = ref(false);
const friendRequests = ref([]);
const friends = ref([]);
const friendsError = ref(false);

function searchChatRooms(event) {
  const query = event.query.toLowerCase();
  filteredChatRooms.value = props.acceptedChatRooms.filter((r) =>
    r.name.toLowerCase().includes(query)
  );
}

function setIsHovering(val) {
  isHovering.value = val;
}

function openLogoutDialog() {
  isLogoutDialogOpen.value = true;
}

function onClickSettingsDialogOpen() {
  settingsDialogOpen.value = true;
}

async function onClickFriendsDialogOpen() {
  friendsDialogOpen.value = true;
  try {
    const response = await getFriends();
    friends.value = response.data.accepted;
    friendRequests.value = response.data.pendingReceived;
  } catch (e) {
    friendsError.value = true;
  }
}

async function handleClickSaveProfile() {
  await updateUser({
    bio: currentUser.value.bio,
    displayName: currentUser.value.displayName,
  });
  settingsDialogOpen.value = false;
}

function handleAutocompleteRoomClick(event) {
  searchText.value = "";
  emit("select-room", event.value);
}

function handleRoomClick(room) {
  emit("select-room", room);
}

function handleCreateRoom() {
  emit("open-create-room");
}

function handleCreateDM() {
  emit("open-create-dm");
}

function handleClickInvite(room) {
  emit("invite-room", room);
}
</script>

<style>
.p-autocomplete-overlay {
  min-width: 280px !important;
  --p-autocomplete-overlay-background: white;
  --p-autocomplete-overlay-border-radius: 4px;
}

.p-autocomplete-list-container ul {
  padding: 4px;
}

.p-autocomplete-list-container ul li {
  --p-autocomplete-option-border-radius: 4px;
  padding-left: 4px;
  padding-top: 6px;
}

.p-autocomplete-option:not(.p-autocomplete-option-selected):not(
    .p-disabled
  ).p-focus {
  --p-autocomplete-option-focus-background: #e5e7eb;
}
</style>
