<template>
  <main class="w-full flex-1 pt-4 flex flex-col overflow-hidden">
    <h3
      v-if="selectedRoom"
      class="w-full flex items-center justify-between text-lg text-zinc-950 font-semibold text-left border-b-2 border-zinc-300 pb-4 pl-4"
    >
      <div class="flex">
        <Hash class="pr-2"></Hash>
        {{ selectedRoom.name }}
      </div>

      <div class="relative inline-block" @click="toggleMembers">
        <div class="flex mr-4 hover:bg-gray-200 rounded-lg p-2">
          <div class="pr-2">
            {{ selectedRoom.participants.length }}
          </div>
          <Users />
        </div>

        <Popover
          ref="op"
          unstyled
          class="w-64 border-2 border-gray-200 bg-white rounded-lg mr-4 mt-2"
        >
          <div class="flex p-4">
            <div class="flex pr-2 mr-2">
              <Users />
              <div class="pl-2">Members</div>
            </div>
          </div>
          <ul class="text-sm text-zinc-950 p-2">
            <li
              v-for="participant in selectedRoom.participants"
              :key="participant.id"
              class="pl-2 py-2 hover:bg-gray-100 cursor-pointer truncate rounded-md flex items-center text-md"
            >
              <div class="flex items-center">
                <div
                  class="flex bg-zinc-400 w-8 h-8 rounded-full items-center justify-center mr-2"
                >
                  <div class="uppercase">
                    {{ participant.username[0] }}
                  </div>
                </div>
                {{ participant.username }}
              </div>
            </li>
          </ul>
        </Popover>
      </div>
    </h3>

    <div
      v-if="currentUser && !loadingMessages && messages.length > 0"
      ref="messagesContainer"
      class="flex-1 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-4 pr-2 pl-2"
      @scroll="onScroll"
    >
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col"
        :class="
          msg.sender === currentUser.username ? 'items-end' : 'items-start'
        "
      >
        <div
          :class="[
            'p-3 rounded-lg shadow max-w-xs md:max-w-md lg:max-w-lg break-words',
            msg.sender === currentUser.username
              ? 'bg-zinc-950 text-zinc-200 text-right'
              : 'bg-zinc-200 text-zinc-800 text-left',
          ]"
        >
          <div class="flex items-center">
            <div class="text-left font-semibold">
              {{ msg.sender }}
            </div>
            <div class="pl-2 pt-1 text-xs text-zinc-400">
              {{ formatTimestamp(msg.timestamp) }}
            </div>
          </div>
          <div class="pt-1">{{ msg.content }}</div>
        </div>
      </div>
    </div>

    <div
      v-if="selectedRoom && !loadingMessages && !messages.length"
      class="flex-1 flex items-center justify-center text-sm text-gray-500"
    >
      Nothing yet, break the ice?
    </div>

    <div
      v-if="!selectedRoom && !error"
      class="flex-1 flex items-center justify-center text-sm text-gray-500"
    >
      Select a room to start chatting
    </div>

    <div v-if="error && !loadingMessages" class="text-sm text-red-500 flex-1">
      {{ error }}
    </div>

    <div
      v-if="selectedRoom && !loadingMessages"
      class="w-full mt-4 flex items-center pl-2 pr-2 pt-4 pb-4 border-t-2 border-zinc-300"
    >
      <input
        v-model="newMessage"
        @keydown.enter="sendMessage"
        type="text"
        :placeholder="`Message ${selectedRoom.name}...`"
        class="flex-1 p-3 border text-zinc-950 border-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
      />
      <button
        @click="sendMessage"
        class="flex items-center justify-center h-12 w-12 ml-2 rounded-lg hover:bg-zinc-950 hover:text-white transition-colors duration-200"
      >
        <Send class="w-6 h-6"></Send>
      </button>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  selectedRoom: Object,
  messages: Array,
  currentUser: Object,
});

const op = ref(null);

function toggleMembers() {
  op.value.toggle(event);
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);

  const now = new Date();
  const isToday =
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate();

  const localDate = new Date(
    date.toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  );

  const options = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const timeString = localDate.toLocaleTimeString(undefined, options);

  if (isToday) {
    return timeString;
  } else {
    const dateString = localDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    return `${dateString}, ${timeString}`;
  }
}

const emit = defineEmits(["send-message"]);
const newMessage = ref("");

function sendMessage() {
  if (!newMessage.value.trim()) return;
  emit("send-message", newMessage.value);
  newMessage.value = "";
}
</script>
