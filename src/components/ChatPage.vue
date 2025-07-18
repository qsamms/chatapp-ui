<template>
  <div class="flex max-h-screen">
    <ChatSidebar
      :loadingRooms="loadingRooms"
      :acceptedChatRooms="acceptedChatRooms"
      :selectedRoom="selectedRoom"
      :error="error"
      @open-create-room="createRoomDialogOpen = true"
      @select-room="selectRoom"
      @invite-room="handleClickInvite"
    />
    <ChatMain
      :selectedRoom="selectedRoom"
      :messages="messages"
      :currentUser="currentUser"
    />

    <Dialog
      v-model:visible="createRoomDialogOpen"
      modal
      :draggable="false"
      :dismissableMask="true"
      :closeOnEscape="true"
      :pt="{
        root: 'border-2 border-zinc-950 min-w-[400px] md:min-w-[500px] min-h-[250px]',
      }"
    >
      <template #header>
        <div class="flex items-center text-lg font-semibold">
          <Hash class="mr-2 w-5 h-5" /> Create New Channel
        </div>
      </template>
      <div class="flex flex-col gap-4">
        <div class="text-sm text-gray-400 pt-1">
          Create a new channel to chat with friends/teammates.
        </div>
        <div class="flex flex-col gap-4 pl-2 pr-2">
          <div class="flex flex-col">
            <label class="pb-2">Channel Name*</label>
            <input
              v-model="newRoomName"
              class="flex-1 p-3 border border-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
          <button
            class="bg-gray-800 hover:bg-gray-500 rounded py-2 px-4 text-white"
            @click="() => createRoom(newRoomName)"
          >
            Create Channel
          </button>
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="inviteFriendsDialogOpen"
      model
      header="Invite Friends"
      :draggable="false"
      :dismissableMask="true"
      :pt="{
        root: 'min-w-[400px] md:min-w-[500px] min-h-[250px]',
      }"
    >
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getCurrentUserObj } from "@/utils/auth";
import {
  getChatRooms,
  getMessages,
  createChatRoom,
  getFriends,
} from "@/utils/api";
import ChatSidebar from "./ChatSidebar.vue";
import ChatMain from "./ChatMain.vue";

const currentUser = ref(null);

const loadingRooms = ref(false);
const acceptedChatRooms = ref([]);
const invitedChatRooms = ref([]);
const selectedRoom = ref(null);

const loadingMessages = ref(false);
const messages = ref([]);
const error = ref("");
const hasMoreMessages = ref(true);

const createRoomDialogOpen = ref(false);
const newRoomName = ref("");

const inviteFriendsDialogOpen = ref(false);
const currentUserFriends = ref([]);

async function handleClickInvite() {
  currentUserFriends.value = (await getFriends()).data;
  inviteFriendsDialogOpen.value = true;
}

async function fetchChatRooms() {
  loadingRooms.value = true;
  try {
    const res = await getChatRooms();
    acceptedChatRooms.value = res.data.accepted;
    invitedChatRooms.value = res.data.invited;
  } catch (e) {
    error.value = "Failed to load chat rooms";
  } finally {
    loadingRooms.value = false;
  }
}

async function fetchMessages(roomId, beforeTimestamp = null) {
  if (loadingMessages.value || !hasMoreMessages.value) return;
  loadingMessages.value = true;
  try {
    const res = await getMessages(roomId, beforeTimestamp);

    if (res.data.messages?.length === 0) {
      hasMoreMessages.value = false;
    } else {
      if (beforeTimestamp) {
        messages.value = [...res.data.messages, ...messages.value];
      } else {
        messages.value = res.data.messages;
        hasMoreMessages.value = true;
      }
    }
  } catch (e) {
    console.log(e);
    error.value = "Failed to load messages";
  } finally {
    loadingMessages.value = false;
  }
}

function selectRoom(room) {
  selectedRoom.value = room;
  messages.value = [];
  hasMoreMessages.value = true;
  fetchMessages(room.id);
}

async function createRoom(name) {
  try {
    await createChatRoom(name);
    fetchChatRooms();
    newRoomName.value = "";
    createRoomDialogOpen.value = false;
  } catch (e) {
    console.log("Failed to create room");
  }
}

onMounted(async () => {
  currentUser.value = await getCurrentUserObj();
  await fetchChatRooms();
  if (acceptedChatRooms.length) selectRoom(acceptedChatRooms[0]);
});
</script>
