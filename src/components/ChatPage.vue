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
      :moreMessages="moreMessages"
      :isFetchingMore="isFetchingMore"
      @send-message="sendMessage"
      @fetch-more-messages="fetchMoreMessages"
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
                :placeholder="inviteLink"
                class="flex-1 p-3 border text-zinc-950 border-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
              <Copy
                @click="handleClickCopy"
                class="ml-2 pl-2 w-8 h-8 text-zinc-500 cursor-pointer hover:text-zinc-950 hover:bg-gray-200 rounded-lg p-1"
              />
            </div>
          </div>
        </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getCurrentUserObj } from "@/utils/auth";
import {
  getChatRooms,
  getMessages,
  createChatRoom,
  getChatRoomInviteLink,
  updateUser,
} from "@/utils/api";
import ChatSidebar from "./ChatSidebar.vue";
import ChatMain from "./ChatMain.vue";
import BaseDialog from "./Dialog.vue";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BACKEND_URL, FE_URL } from "@/main";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const roomId = route.params.roomId;

let client = null;
const currentUser = ref(null);

const isFetchingMore = ref(false);

const loadingRooms = ref(false);
const acceptedChatRooms = ref([]);
const invitedChatRooms = ref([]);
const selectedRoom = ref(null);

const loadingMessages = ref(false);
const messages = ref([]);
const error = ref("");
const moreMessages = ref(true);

const createRoomDialogOpen = ref(false);
const newRoomName = ref("");

const inviteFriendsDialogOpen = ref(false);

const settingsDialogOpen = ref(false);

const inviteLink = ref("");

async function handleClickSaveProfile() {
  await updateUser({
    bio: currentUser.value.bio,
    displayName: currentUser.value.displayName,
  });
  settingsDialogOpen.value = false;
}

function handleClickCopy() {
  navigator.clipboard.writeText(inviteLink.value);
}

async function handleClickInvite(room) {
  const inviteId = (await getChatRoomInviteLink(room.id)).data.id;
  inviteLink.value = `${FE_URL}/rooms/join/${inviteId}/`;
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
    if (roomId) {
      let roomToSelect = null;
      acceptedChatRooms.value.forEach((room) => {
        if (room.id === roomId) {
          roomToSelect = room;
        }
      });
      if (roomToSelect) selectRoom(roomToSelect);
      return;
    }
    if (acceptedChatRooms.value.length > 0) {
      selectRoom(acceptedChatRooms.value[0]);
    }
  } catch (e) {
    error.value = "Failed to load chat rooms";
  } finally {
    loadingRooms.value = false;
  }
}

async function fetchMoreMessages() {
  isFetchingMore.value = true;
  const earliestTimestamp = messages.value[0].timestamp;
  const res = await getMessages(selectedRoom.value?.id, earliestTimestamp);
  moreMessages.value = res.data.hasMore;
  const newMessages = res.data.messages;
  newMessages.reverse();
  messages.value = [...newMessages, ...messages.value];
  isFetchingMore.value = false;
}

async function fetchMessages() {
  loadingMessages.value = true;
  try {
    const res = await getMessages(selectedRoom.value?.id);
    const newMessages = res.data.messages;
    newMessages.reverse();
    moreMessages.value = res.data.hasMore;
    messages.value = newMessages;
  } catch (e) {
    console.error(e);
    error.value = "Failed to load messages";
  } finally {
    loadingMessages.value = false;
  }
}

async function selectRoom(room) {
  if (room.id === selectedRoom.value?.id) return;
  router.push(`/chat/${room.id}`);
  selectedRoom.value = room;
  messages.value = [];
  moreMessages.value = true;
  fetchMessages();
  await initWSConnection();
}

async function initWSConnection() {
  if (client) await client.deactivate({ force: true });
  client = new Client({
    webSocketFactory: () =>
      new SockJS(
        `${BACKEND_URL}/ws?token=${encodeURIComponent(
          localStorage.getItem("token")
        )}`
      ),
    onConnect: function (frame) {
      client.subscribe(
        `/topic/chatroom/${selectedRoom.value.id}/`,
        (message) => {
          const messageBody = JSON.parse(message.body);
          if (message.body) {
            messages.value = [...messages.value, messageBody];
          }
        }
      );
    },
    debug: (str) => {
      console.log("STOMP DEBUG:", str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });
  client.activate();
}

function sendMessage(message) {
  if (client && client.connected) {
    client.publish({
      destination: `/app/chatroom/${selectedRoom.value.id}/send/`,
      body: JSON.stringify(message),
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
});
</script>
