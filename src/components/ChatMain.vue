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
          class="w-64 border-2 border-gray-200 bg-white rounded-lg mr-4 mt-2 shadow-lg"
        >
          <div class="flex px-4 py-2 mt-1 border-b-2 border-gray-200">
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
      class="flex-1 overflow-y-auto pr-2 pl-2"
      @scroll="onScroll"
    >
      <div class="flex flex-col justify-end min-h-full space-y-2">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :ref="setMessageRef(msg.id)"
          class="flex flex-col"
          :class="
            msg.sender === currentUser.username ? 'items-end' : 'items-start'
          "
        >
          <div class="flex items-center">
            <div
              v-if="msg.sender !== currentUser.username"
              class="text-zinc-800 flex bg-slate-200 w-8 h-8 rounded-full items-center justify-center mr-2"
            >
              <div class="uppercase">
                {{ msg.sender[0] }}
              </div>
            </div>
            <div
              :class="[
                'p-3 rounded-lg shadow max-w-xl break-words',
                msg.sender === currentUser.username
                  ? 'bg-zinc-950 text-zinc-200 text-right'
                  : 'bg-slate-200 text-zinc-800 text-left',
              ]"
            >
              <div class="flex items-center">
                <div class="text-left font-semibold">
                  {{ msg.sender }}
                </div>
                <div class="pl-2 text-xs text-zinc-400">
                  {{ formatTimestamp(msg.timestamp) }}
                </div>
              </div>
              <div v-if="msg.mediaUrl" class="mt-2">
                <DashPlayer
                  v-if="isDashVideo(msg.mediaUrl)"
                  :src="`${BACKEND_URL}/${msg.mediaUrl}`"
                />
                <img
                  v-else-if="
                    isImage(msg.mediaUrl) && imageBlobs.get(msg.mediaUrl)
                  "
                  :src="imageBlobs.get(msg.mediaUrl)"
                  alt="Attached Image"
                  style="max-width: 400px; max-height: 400px"
                  class="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
              <div class="pt-1 text-left whitespace-pre-wrap">
                {{ msg.content }}
              </div>
            </div>
            <div
              v-if="msg.sender === currentUser.username"
              class="ml-2 text-zinc-800 flex bg-slate-200 w-8 h-8 rounded-full items-center justify-center"
            >
              <div class="uppercase">
                {{ msg.sender[0] }}
              </div>
            </div>
          </div>
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
      v-if="files && files.length > 0"
      class="w-full mt-4 flex flex-col justify-center px-2 pt-2 border-t-2 border-zinc-300"
    >
      <div class="flex items-center text-zinc-700">
        <Paperclip class="w-6 h-6 pr-2" />
        <span class="font-semibold">{{ files.length }} file(s) selected</span>
      </div>

      <div class="flex pt-2 pl-2 gap-2 overflow-x-auto pb-2">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="flex p-2 rounded-lg bg-gray-200 items-center w-48 flex-shrink-0"
        >
          <File class="w-8 h-8 pr-2 flex-shrink-0"></File>
          <div class="flex flex-col flex-grow min-w-0">
            <div
              class="font-semibold text-zinc-950 whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {{ file.name }}
            </div>
            <div class="text-xs text-zinc-600">
              {{ Math.round((file.size / 1024 / 1024) * 10) / 10 }} MB
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="selectedRoom && !loadingMessages"
      class="w-full mt-4 flex items-center pl-2 pr-2 pt-4 pb-4 border-t-2 border-zinc-300"
    >
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        @change="handleFileChange"
        accept="image/*, video/*"
        :multiple="false"
      />

      <button
        @click="triggerFileInput"
        class="flex items-center justify-center h-12 w-12 mr-2 rounded-lg hover:bg-zinc-950 hover:text-white transition-colors duration-200"
        title="Attach File"
      >
        <Paperclip class="w-6 h-6"></Paperclip>
      </button>
      <textarea
        ref="textAreaRef"
        @input="autoResize"
        v-model="newMessage"
        @keydown.enter="onEnter"
        rows="1"
        type="text"
        :placeholder="`Message ${selectedRoom.name}...`"
        class="scrollbar-hide resize-none flex-1 p-3 border text-zinc-950 border-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
      />
      <button
        @click="sendMessage"
        class="flex items-center justify-center h-12 w-12 ml-2 rounded-lg hover:bg-zinc-950 hover:text-white transition-colors duration-200"
      >
        <LoaderCircle
          v-if="isSending"
          class="w-6 h-6 animate-spin"
        ></LoaderCircle>
        <Send v-else class="w-6 h-6"></Send>
      </button>
    </div>
  </main>
</template>

<script setup>
import { uploadFiles, fetchImageBlob } from "@/utils/api";
import { ref, watch, nextTick } from "vue";
import DashPlayer from "./DashPlayer.vue";
import { BACKEND_URL } from "@/main";

const props = defineProps({
  selectedRoom: Object,
  messages: Array,
  currentUser: Object,
  moreMessages: Boolean,
  isFetchingMore: Boolean,
});

const messagesContainer = ref(null);
const textAreaRef = ref(null);
const op = ref(null);
const fileInput = ref(null);
const files = ref([]);
const imageBlobs = ref(new Map());
const isSending = ref(false);

const messageRefs = ref(new Map());
const scrollToMessageId = ref(null);

watch(
  () => props.messages,
  async () => {
    if (scrollToMessageId.value) {
      await nextTick();
      scrollToMessage(scrollToMessageId.value);
      scrollToMessageId.value = null;
    } else {
      await nextTick();
      const el = messagesContainer.value;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }
);

function setMessageRef(id) {
  return (el) => {
    if (el) {
      messageRefs.value.set(id, el);
    }
  };
}

function scrollToMessage(messageId) {
  console.log("asdf");

  const el = messageRefs.value.get(messageId);
  if (el) {
    el.scrollIntoView({ block: "start" });
  }
}

function autoResize() {
  const el = textAreaRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

watch(
  () => props.messages,
  async (newMessages, _, onCleanup) => {
    const activeUrls = new Set();

    for (const msg of newMessages) {
      if (msg.mediaUrl && isImage(msg.mediaUrl)) {
        if (!imageBlobs.value.has(msg.mediaUrl)) {
          const blobUrl = await fetchImageBlob(msg.mediaUrl);
          imageBlobs.value.set(msg.mediaUrl, blobUrl);
        }
        activeUrls.add(msg.mediaUrl);
      }
    }

    onCleanup(() => {
      for (const [key, url] of imageBlobs.value.entries()) {
        if (!activeUrls.has(key)) {
          URL.revokeObjectURL(url);
          imageBlobs.value.delete(key);
        }
      }
    });
  },
  { immediate: true, deep: true }
);

function isImage(url) {
  return /\.(jpeg|jpg|png|gif|webp|bmp)$/i.test(url);
}

function isDashVideo(url) {
  return /\.mpd$/i.test(url);
}

function toggleMembers() {
  op.value.toggle(event);
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const options = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const timeString = date.toLocaleTimeString(undefined, options);

  if (isToday) {
    return timeString;
  } else {
    const dateOptions =
      date.getFullYear() != now.getFullYear()
        ? { month: "short", day: "numeric", year: "numeric" }
        : { month: "short", day: "numeric" };
    const dateString = date.toLocaleDateString(undefined, dateOptions);
    return `${dateString}, ${timeString}`;
  }
}

function handleFileChange(event) {
  const fileInput = event.target;
  files.value = fileInput.files;
}

function triggerFileInput() {
  fileInput.value.click();
}

const emit = defineEmits(["send-message", "fetch-more-messages"]);
const newMessage = ref("");

function onEnter(event) {
  if (event.shiftKey) {
    return;
  }

  event.preventDefault();
  sendMessage();
}

async function sendMessage() {
  if (!newMessage.value.trim() && files.value.length == 0) return;

  isSending.value = true;

  let mediaUrl = "";

  if (files.value.length > 0) {
    const formData = new FormData();

    formData.append("file", files.value[0]);

    try {
      const response = await uploadFiles(formData);
      mediaUrl = response.data;
    } catch (e) {
      console.error(e);
      isSending.value = false;
      return;
    }
  }
  emit("send-message", { content: newMessage.value, mediaUrl: mediaUrl });
  newMessage.value = "";
  files.value = [];
  isSending.value = false;

  nextTick(() => {
    if (textAreaRef.value) {
      textAreaRef.value.style.height = "auto";
    }
  });
}

const onScroll = () => {
  const container = messagesContainer.value;
  if (
    container &&
    container.scrollTop <= 100 &&
    props.moreMessages &&
    !props.isFetchingMore
  ) {
    const topMessage = props.messages[0];
    if (topMessage) {
      scrollToMessageId.value = topMessage.id;
    }

    emit("fetch-more-messages");
  }
};
</script>
