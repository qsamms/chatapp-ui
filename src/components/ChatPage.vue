<template>
  <div class="flex min-h-screen">
    <aside
      class="w-80 border-r border-gray-800 overflow-y-auto p-2 flex flex-col justify-between"
    >
      <div>
        <div v-if="loadingRooms" class="text-sm text-gray-600">
          Loading rooms...
        </div>
        <div v-if="error" class="text-sm text-red-500">{{ error }}</div>

        <div
          v-if="acceptedChatRooms.length"
          class="text-sm text-gray-600 border-gray-800 border-b-2 pb-4 pt-4"
        >
          <div class="flex justify-between items-center">
            <div class="flex text-lg">
              <div class="pr-2">
                <MessageCircle></MessageCircle>
              </div>
              Chats
            </div>
          </div>
        </div>

        <div class="flex justify-between text-lg text-gray-600 pt-4">
          <span>Channels</span
          ><Plus
            @click="createRoomDialogOpen = true"
            class="cursor-pointer hover:opacity-80"
          ></Plus>
        </div>

        <table
          v-if="acceptedChatRooms.length"
          class="w-full mb-4 mt-2"
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
                  'p-2 flex justify-between items-center cursor-pointer min-h-16 rounded-lg' /* Increased min-h and added rounding here */,
                  selectedRoom?.id === room.id
                    ? 'bg-gray-800'
                    : 'hover:bg-gray-800',
                  // Apply bottom border conditionally or to all except last one
                  // For simplicity, let's remove default border-b and use gap
                  // 'border-b border-gray-200' // Remove this if using border-spacing
                ]"
              >
                <div class="flex items-center text-base">
                  <Hash class="pr-2"></Hash>
                  {{ room.name }}
                </div>

                <button
                  @click.stop="handleClickInvite(room)"
                  class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <UserPlus />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </aside>

    <Dialog
      v-model:visible="createRoomDialogOpen"
      model
      header="Create New Channel"
      :draggable="false"
      :pt="{
        root: ' min-w-[400px] md:min-w-[500px] min-h-[250px]',
      }"
    >
      <div class="flex flex-col">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col">
            <label class="pb-2">Channel Name</label>
            <InputText v-model="newRoomName"></InputText>
          </div>
          <button
            class="bg-gray-800 hover:bg-gray-500 rounded py-2 px-4 text-white"
            @click="() => createRoom(newRoomName)"
          >
            Create
          </button>
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="inviteFriendsDialogOpen"
      model
      header="Invite Friends"
    >
    </Dialog>

    <main class="flex-1 p-4 flex flex-col overflow-hidden">
      <h3
        v-if="selectedRoom"
        class="text-lg text-gray-600 font-semibold text-left"
      >
        {{ selectedRoom.name }}
      </h3>

      <div
        v-if="selectedRoom && !loadingMessages && !messages.length"
        class="mt-4 text-sm text-gray-500"
      >
        Nothing yet!
      </div>

      <div v-if="error && !loadingMessages" class="text-sm text-red-500">
        {{ error }}
      </div>

      <div
        v-if="!loadingMessages && messages.length > 0"
        ref="messagesContainer"
        class="flex-1 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-4"
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
              msg.sender === currentUser
                ? 'bg-blue-200 text-right'
                : 'bg-gray-100 text-left',
            ]"
          >
            <div>{{ msg.content }}</div>
          </div>
        </div>
      </div>

      <div
        v-if="!loadingMessages && selectedRoom && messages.length"
        class="relative w-full mt-4 flex items-center"
      >
        <input
          v-model="message"
          @keydown.enter="sendMessage"
          type="text"
          :placeholder="`Message ${selectedRoom.name}...`"
          class="flex-1 p-3 pr-12 text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
        />
        <button
          @click="sendMessage"
          class="absolute right-0 mr-2 text-white p-2 rounded-md hover:bg-slate-100 hover:text-gray-800"
        >
          <Send></Send>
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
