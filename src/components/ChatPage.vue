<template>
  <div class="flex min-h-screen max-h-screen">
    <ChatSidebar
      :loadingRooms="loadingRooms"
      :acceptedChatRooms="acceptedChatRooms"
      :selectedRoom="selectedRoom"
      :error="error"
      :settingsDialogOpen="settingsDialogOpen"
      @open-create-room="createRoomDialogOpen = true"
      @select-room="selectRoom"
      @invite-room="handleClickInvite"
      @settings-clicked="handleClickSettings"
    />
    <ChatMain
      :selectedRoom="selectedRoom"
      :messages="messages"
      :currentUser="currentUser"
      @send-message="sendMessage"
    />

    <BaseDialog
      v-model="createRoomDialogOpen"
      :closeOnEscape="true"
      :darkBackground="true"
    >
      <template #header>
        <div class="flex flex-col">
          <div class="text-lg font-semibold flex items-center">
            <Hash class="mr-2 w-5 h-5" />
            Create New Channel
          </div>
          <div class="text-sm text-gray-400 pt-2">
            Create a new channel to chat with friends/teammates.
          </div>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-4 pl-2 pr-2">
          <div class="flex flex-col">
            <label class="pb-2">Channel Name*</label>
            <input
              v-model="newRoomName"
              class="flex-1 p-3 border border-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
          <button
            class="bg-zinc-950 hover:bg-zinc-700 rounded py-2 px-4 text-white"
            @click="() => createRoom(newRoomName)"
          >
            Create Channel
          </button>
        </div>
      </div>
    </BaseDialog>

    <BaseDialog
      v-model="inviteFriendsDialogOpen"
      :closeOnEscape="true"
      :darkBackground="true"
    >
      <template #header>
        <div class="flex flex-col">
          <div class="text-lg font-semibold flex items-center">
            <Hash class="mr-2 w-5 h-5" />
            Add Friends
          </div>
          <div class="text-sm text-gray-400 pt-2">
            Add your friends to this channel.
          </div>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-4 pl-2 pr-2">
          <div class="flex flex-col">
            <label>Invite Link:</label>
            <div class="flex items-center">
              <input
                readonly
                placeholder="somelink"
                class="flex-1 p-3 border text-zinc-950 border-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
              <Copy
                class="ml-2 pl-2 w-8 h-8 text-zinc-500 cursor-pointer hover:text-zinc-950 hover:bg-gray-200 rounded-lg p-1"
              />
            </div>
          </div>
          <div class="flex flex-col">
            <label>Invite by email:</label>
            <div class="flex items-center">
              <input
                placeholder="user@somemail.whatever"
                class="flex-1 p-3 border border-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
              <Send
                class="ml-2 w-8 h-8 text-zinc-500 cursor-pointer hover:text-zinc-950 hover:bg-gray-200 rounded-lg p-1"
              />
            </div>
          </div>
        </div>
      </div>
    </BaseDialog>

    <BaseDialog v-model="settingsDialogOpen">
      <template #header>
        <button @click="logout()">logout</button>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getCurrentUserObj, logout } from "@/utils/auth";
import {
  getChatRooms,
  getMessages,
  createChatRoom,
  getFriends,
} from "@/utils/api";
import ChatSidebar from "./ChatSidebar.vue";
import ChatMain from "./ChatMain.vue";
import BaseDialog from "./Dialog.vue";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BACKEND_URL } from "@/main";

let client = null;
const socket = new SockJS(
  `${BACKEND_URL}/ws?token=${encodeURIComponent(localStorage.getItem("token"))}`
);
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

const settingsDialogOpen = ref(false);

async function handleClickInvite() {
  currentUserFriends.value = (await getFriends()).data;
  inviteFriendsDialogOpen.value = true;
}

async function handleClickSettings() {
  settingsDialogOpen.value = true;
}

async function fetchChatRooms() {
  loadingRooms.value = true;
  try {
    const res = await getChatRooms();
    acceptedChatRooms.value = res.data.accepted;
    invitedChatRooms.value = res.data.invited;
    if (acceptedChatRooms.value.length > 0) {
      selectRoom(acceptedChatRooms.value[0]);
    }
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
  initWSConnection();
}

function initWSConnection() {
  client = new Client({
    webSocketFactory: () => socket,
    onConnect: function (frame) {
      client.subscribe(
        `/topic/chatroom/${selectedRoom.value.id}/`,
        (message) => {
          console.log("recieved message: ", message.body);
          const messageBody = JSON.parse(message.body);
          if (message.body) {
            messages.value = [messages, messageBody];
          }
        }
      );
    },
  });
  client.activate();
}

function sendMessage(message) {
  if (client) {
    client.publish({
      destination: `/app/chatroom/${selectedRoom.value.id}/send/`,
      body: JSON.stringify({ content: message }),
      headers: { "content-type": "application/json" },
    });
  }
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
