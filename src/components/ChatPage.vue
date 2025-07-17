<template>
  <div class="flex min-h-screen">
    <aside
      class="w-80 border-r border-zinc-300 overflow-y-auto flex flex-col justify-between"
    >
      <div>
        <div v-if="loadingRooms" class="text-sm text-zinc-950 p-2">
          Loading rooms...
        </div>
        <div v-if="error" class="text-sm text-red-500 p-2">{{ error }}</div>

        <div
          v-if="acceptedChatRooms.length"
          class="text-sm w-full text-zinc-950 border-zinc-300 border-b-2 pl-2 pb-4 pt-4 pr-2"
        >
          <div class="flex justify-between items-center w-full">
            <div class="flex text-lg">
              <div class="pr-2">
                <MessageCircle></MessageCircle>
              </div>
              Chats
            </div>
          </div>
        </div>

        <div class="flex justify-between text-lg text-zinc-950 pt-4 pl-2 pr-2">
          <span>Channels</span
          ><Plus
            @click="createRoomDialogOpen = true"
            class="cursor-pointer hover:bg-zinc-950 hover:text-white rounded-md"
          ></Plus>
        </div>

        <table
          v-if="acceptedChatRooms.length"
          class="w-full mb-4 mt-2 pl-2 pr-2"
          style="border-collapse: separate; border-spacing: 0 0.5rem"
        >
          <tbody>
            <tr
              v-for="room in acceptedChatRooms"
              :key="room.id"
              class="group"
              @click="selectRoom(room)"
            >
              <td
                :class="[
                  'p-2 flex justify-between items-center cursor-pointer min-h-12 rounded-lg',
                  selectedRoom?.id === room.id
                    ? 'bg-zinc-950 text-white'
                    : 'hover:bg-zinc-200',
                ]"
              >
                <div class="flex items-center text-base">
                  <Hash class="pr-2"></Hash>
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
      <div class="pt-4 pb-4 pl-2 pr-2 border-t-2 border-zinc-300">
        <div class="flex items-center text-lg text-zinc-950 pl-4 pr-4 py-2 hover:bg-zinc-200 rounded-lg cursor-pointer">
        <Settings class="pr-2 w-6 h-6"></Settings>
      Settings
        </div>
      </div>
    </aside>

    <Dialog
      v-model:visible="createRoomDialogOpen"
      model
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
          <div class="flex flex-col ">
            <label class="pb-2">Channel Name *</label>
            <input v-model="newRoomName" class="flex-1 p-3 border border-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"></input>
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

    <main class="flex-1 p-4 flex flex-col overflow-hidden">
      <h3
        v-if="selectedRoom"
        class="w-full flex items-center text-lg text-zinc-950 font-semibold text-left border-b-2 border-zinc-300 pb-4"
      >
        <Hash class="pr-2"></Hash>
        {{ selectedRoom.name }}
      </h3>

      <div
        v-if="!loadingMessages && messages.length > 0"
        ref="messagesContainer"
        class="flex-1 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-4 pr-2"
        @scroll="onScroll"
      >
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex flex-col"
          :class="
            currentUser.value && msg.sender === currentUser.value.username
              ? 'items-end'
              : 'items-start'
          "
        >
          <div class="text-xs text-gray-500 mb-1">
            <span class="font-medium">{{ msg.sender }}</span>
            ·
            <span>{{ new Date(msg.timestamp).toLocaleString() }}</span>
          </div>

          <div
            :class="[
              'p-3 rounded shadow max-w-xs md:max-w-md lg:max-w-lg break-words',
              currentUser.value && msg.sender === currentUser.value.username // Corrected condition
                ? 'bg-blue-200 text-right'
                : 'bg-gray-100 text-left',
            ]"
          >
            <div>{{ msg.content }}</div>
          </div>
        </div>
      </div>

      <div
        v-if="selectedRoom && !loadingMessages && !messages.length"
        class="mt-4 text-sm text-center text-gray-500 flex-1"
      >
        Nothing yet!
      </div>

      <div v-if="error && !loadingMessages" class="text-sm text-red-500 flex-1">
        {{ error }}
      </div>

      <div
        v-if="selectedRoom && !loadingMessages"
        class="w-full mt-4 flex items-center rounded-lg p-2"
      >
        <input
          v-model="message"
          @keydown.enter="sendMessage"
          type="text"
          :placeholder="`Message ${selectedRoom.name}...`"
          class="flex-1 p-3 border border-zinc-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-950"
        />
        <button
          @click="sendMessage"
          class="flex items-center justify-center h-12 w-12 ml-2 rounded-lg hover:bg-zinc-950 hover:text-white transition-colors duration-200"
        >
          <Send class="w-6 h-6"></Send>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { getCurrentUserObj } from "@/utils/auth";
import { InputText } from "primevue";
import {
  getChatRooms,
  getMessages,
  createChatRoom,
  getFriends,
} from "@/utils/api";

const currentUser = ref(null);

const loadingRooms = ref(false);
const acceptedChatRooms = ref([]);
const invitedChatRooms = ref([]);
const selectedRoom = ref(null);

const messagesContainer = ref(null);
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

function onScroll() {
  const el = messagesContainer.value;
  if (!el || loadingMessages.value || !hasMoreMessages.value) return;

  const scrollFromTop = el.scrollHeight - el.clientHeight - -el.scrollTop;
  if (scrollFromTop < 100) {
    if (messages.value.length > 0) {
      const oldestTimestamp = messages.value[0].timestamp;
      fetchMessages(selectedRoom.value.id, oldestTimestamp);
    }
  }
}

watch(messages, async (newVal, oldVal) => {
  await nextTick();
  const el = messagesContainer.value;
  if (!el) return;

  if (!oldVal || oldVal.length === 0) {
    el.scrollTop = el.scrollHeight;
  } else if (newVal.length > oldVal.length) {
    const addedHeight = el.scrollHeight - (el._prevScrollHeight || 0);
    el.scrollTop = el.scrollTop + addedHeight;
  }
  el._prevScrollHeight = el.scrollHeight;
});

onMounted(async () => {
  currentUser.value = await getCurrentUserObj();
  await fetchChatRooms();
  if (acceptedChatRooms.length) selectRoom(acceptedChatRooms[0]);
  console.log(currentUser.value.username, messages);
});
</script>
