<template>
  <main class="w-full flex-1 pt-4 flex flex-col overflow-hidden">
    <h3
      v-if="selectedRoom"
      class="w-full flex items-center text-lg text-zinc-950 font-semibold text-left border-b-2 border-zinc-300 pb-4 pl-4"
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
        v-model="message"
        @keydown.enter="sendMessage"
        type="text"
        :placeholder="`Message ${selectedRoom.name}...`"
        class="flex-1 p-3 border border-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
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
});

const emit = defineEmits(["send-message"]);
const newMessage = ref("");

function sendMessage() {
  if (!newMessage.value.trim()) return;
  emit("send-message", newMessage.value);
  newMessage.value = "";
}
</script>
