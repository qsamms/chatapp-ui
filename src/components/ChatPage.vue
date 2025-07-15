<template>
  <div class="flex min-h-screen">
    <NavBar :items="navItems" @navigate="onClickNavigate"></NavBar>
    <!-- Sidebar -->
    <aside
      class="w-60 border-r border-gray-300 overflow-y-auto p-4 flex flex-col justify-between"
    >
      <div>
        <div v-if="loadingRooms" class="text-sm text-gray-600">
          Loading rooms...
        </div>
        <div v-if="error" class="text-sm text-red-500">{{ error }}</div>

        <div v-if="acceptedChatRooms.length" class="text-sm text-gray-600">
          <div class="flex justify-between">
            <span>Your rooms</span>
            <AddChatRoom
              @click="createRoomDialogOpen = true"
              class="cursor-pointer hover:opacity-80"
            ></AddChatRoom>
          </div>
        </div>
        <table
          v-if="acceptedChatRooms.length"
          class="w-full border-separate mb-4"
        >
          <tbody>
            <tr
              v-for="room in acceptedChatRooms"
              :key="room.id"
              :class="[
                'cursor-pointer',
                selectedRoom?.id === room.id
                  ? 'bg-blue-100'
                  : 'hover:bg-gray-100',
              ]"
              @click="selectRoom(room)"
            >
              <td class="p-2 border-b border-gray-200">
                {{ room.name }}
              </td>
              <td class="p-2 border-b border-gray-200 text-right">
                <button @click.stop="handleClickInvite(room)">
                  <MailPlus />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="invitedChatRooms.length" class="text-sm text-gray-600">
          Invited Rooms
        </div>
        <table v-if="invitedChatRooms.length" class="w-full border-separate">
          <tbody>
            <tr
              v-for="room in invitedChatRooms"
              :key="room.id"
              :class="[
                'cursor-pointer',
                selectedRoom?.id === room.id
                  ? 'bg-blue-100'
                  : 'hover:bg-gray-100',
              ]"
              @click="selectRoom(room)"
            >
              <td class="p-2 border-b border-gray-200">{{ room.name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </aside>

    <Dialog
      v-model:visible="createRoomDialogOpen"
      model
      header="Create Room"
      position="topleft"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col">
          <label>Name</label>
          <InputText v-model="newRoomName"></InputText>
        </div>
        <Button @click="() => createRoom(newRoomName)">Create</Button>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="inviteFriendsDialogOpen"
      model
      header="Invite Friends"
    >
    </Dialog>

    <!-- Main Chat Area -->
    <main class="flex-1 p-4 flex flex-col overflow-hidden">
      <h3 v-if="selectedRoom" class="text-lg font-semibold text-left">
        {{ selectedRoom.name }}
      </h3>

      <div v-if="loadingMessages" class="text-sm text-gray-600">
        Loading messages...
      </div>
      <div v-if="error && !loadingMessages" class="text-sm text-red-500">
        {{ error }}
      </div>

      <!-- Messages container: scrollable and fills available space -->
      <div
        v-if="!loadingMessages && messages.length"
        ref="messagesContainer"
        class="flex-1 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-4"
        @scroll="onScroll"
      >
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex flex-col"
          :class="msg.sender === currentUser ? 'items-end' : 'items-start'"
        >
          <div class="text-xs text-gray-500 mb-1">
            <span class="font-medium">{{ msg.sender }}</span>
            ·
            <span>{{ new Date(msg.timestamp).toLocaleString() }}</span>
          </div>

          <div
            :class="[
              'p-3 rounded shadow max-w-xs md:max-w-md lg:max-w-lg break-words',
              msg.sender === currentUser
                ? 'bg-blue-200 text-right'
                : 'bg-gray-100 text-left',
            ]"
          >
            <div>{{ msg.content }}</div>
          </div>
        </div>
      </div>

      <!-- No messages -->
      <div
        v-else-if="selectedRoom && !loadingMessages && !messages.length"
        class="mt-4 text-sm text-gray-500"
      >
        No messages yet in this chat room.
      </div>

      <!-- No room selected -->
      <div v-else-if="!selectedRoom" class="mt-4 text-sm text-gray-500">
        Select a chat room to view messages.
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { getCurrentUserObj } from "@/utils/auth";
import { InputText } from "primevue";
import router from "../router";
import {
  getChatRooms,
  getMessages,
  createChatRoom,
  getFriends,
} from "@/utils/api";
import { navItems, onClickNavigate } from "../router";
import NavBar from "./NavBar.vue";

const currentUser = ref("");

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

    if (res.data.messages.length === 0) {
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
  currentUser.value = await getCurrentUserObj().username;
  fetchChatRooms();
});
</script>
