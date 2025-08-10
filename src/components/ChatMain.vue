<template>
  <main class="w-full flex-1 pt-4 flex flex-col overflow-hidden">
    <ChatMainHeader
      :selectedRoom="selectedRoom"
      :currentUser="currentUser"
      @select-temp-dm-room="selectTempDmRoom"
    ></ChatMainHeader>
    <div
      v-if="currentUser && !loadingMessages && messages.length > 0"
      ref="messagesContainer"
      class="flex-1 overflow-y-auto min-w-0"
      @scroll="onScroll"
    >
      <div class="flex flex-col justify-end min-h-full">
        <div
          v-for="(group, groupIndex) in groupedMessages"
          :key="groupIndex"
          class="flex flex-col p-4 border-b border-gray-200 last:border-b-0 text-zinc-950"
          :class="groupIndex % 2 === 0 ? 'bg-gray-50' : ''"
        >
          <div class="flex items-start">
            <div
              v-if="
                groupIndex === 0 ||
                groupedMessages[groupIndex - 1].sender.username !==
                  group.sender.username
              "
              class="text-zinc-800 flex bg-slate-200 w-9 h-9 rounded-full items-center justify-center mr-2 flex-shrink-0"
            >
              <div
                v-if="group.sender.displayName"
                class="uppercase font-semibold"
              >
                {{ group.sender.displayName[0] }}
              </div>
              <div v-else class="uppercase font-semibold">
                {{ group.sender.firstName[0] }}{{ group.sender.lastName[0] }}
              </div>
            </div>
            <div v-else class="w-9 h-9 mr-2 flex-shrink-0"></div>

            <div class="min-w-0 break-words w-full">
              <div
                v-if="
                  groupIndex === 0 ||
                  groupedMessages[groupIndex - 1].sender.username !==
                    group.sender.username
                "
                class="flex items-center min-w-0 w-full"
              >
                <div class="flex text-left items-center font-semibold">
                  <div v-if="group.sender.displayName">
                    {{ group.sender.displayName }}
                  </div>
                  <div v-else>
                    {{ group.sender.firstName }} {{ group.sender.lastName }}
                  </div>
                </div>
                <div class="pl-2 text-xs text-zinc-400">
                  {{ formatTimestamp(group.messages[0].timestamp) }}
                </div>
              </div>

              <div
                v-for="(msg, msgIndex) in group.messages"
                :key="msg.id"
                :ref="setMessageRef(msg.id)"
                class="pt-2 text-left whitespace-pre-wrap break-words"
              >
                <div
                  class="pt-1 text-left whitespace-pre-wrap break-words"
                  v-html="msg.content"
                />
                <div v-if="msg.mediaUrl" class="mt-2">
                  <DashPlayer
                    v-if="
                      isDashVideo(msg.mediaUrl) && visibleMessageIds.has(msg.id)
                    "
                    :src="`${BACKEND_URL}/${msg.mediaUrl}`"
                  />
                  <div
                    v-else-if="
                      isImage(msg.mediaUrl) &&
                      imageBlobs.get(msg.mediaUrl) &&
                      visibleMessageIds.has(msg.id)
                    "
                    class="relative"
                    @mouseenter="hoveredImageId = msg.id"
                    @mouseleave="hoveredImageId = null"
                  >
                    <img
                      :src="imageBlobs.get(msg.mediaUrl)"
                      alt="Attached Image"
                      class="rounded max-h-[200px] transition-all duration-200"
                      :class="{ 'brightness-75': hoveredImageId === msg.id }"
                      @click="openImageEnlarged(imageBlobs.get(msg.mediaUrl))"
                    />
                    <div
                      v-if="hoveredImageId === msg.id"
                      class="absolute inset-0 flex items-center justify-center max-h-[200px] cursor-pointer"
                      @click="openImageEnlarged(imageBlobs.get(msg.mediaUrl))"
                    >
                      <ZoomIn class="w-8 h-8 text-white opacity-90" />
                    </div>
                  </div>
                  <div
                    v-else-if="
                      isImage(msg.mediaUrl) &&
                      !imageBlobs.has(msg.mediaUrl) &&
                      visibleMessageIds.has(msg.id) &&
                      failedImageUrls.has(msg.id)
                    "
                    class="flex flex-col items-center justify-center border-2 border-dashed border-zinc-950 rounded-md h-[200px] aspect-[3/2] object-contain"
                  >
                    <div class="p-4 flex flex-col items-center">
                      <ImageOff class="w-8 h-8 pb-2"></ImageOff>
                      <div>Failed to load image</div>
                    </div>
                  </div>
                  <div
                    v-else="
                      isImage(msg.mediaUrl) &&
                      !imageBlobs.has(msg.mediaUrl) &&
                      visibleMessageIds.has(msg.id) &&
                      !failedImageUrls.has(msg.id)
                    "
                    class="h-[200px] aspect-[3/2] flex items-center justify-center rounded"
                  >
                    <LoaderCircle class="w-8 h-8 animate-spin"></LoaderCircle>
                  </div>
                </div>
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
      <div v-if="!selectedRoom.dm" class="flex flex-col items-center">
        <MessagesSquare class="mb-4 w-8 h-8"></MessagesSquare>
        Nothing yet, break the ice?
      </div>
      <div v-else class="flex flex-col items-center">
        <MessagesSquare class="mb-4 w-8 h-8"></MessagesSquare>
        Send a message to start a DM
      </div>
    </div>

    <ChatInput
      :selectedRoom="selectedRoom"
      :loadingMessages="loadingMessages"
      @send-message="sendMessage"
    ></ChatInput>
  </main>

  <transition name="fade">
    <div
      v-if="enlargedImage"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      @click="closeImageEnlarged"
    >
      <div class="relative max-w-4xl max-h-screen p-4">
        <button
          @click.stop="closeImageEnlarged"
          class="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
        >
          <X class="w-6 h-6" />
        </button>
        <img
          :src="enlargedImage"
          alt="Enlarged image"
          class="max-w-full max-h-[90vh] object-contain"
          @click.stop
        />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { fetchImageBlob } from "@/utils/api";
import { ref, watch, nextTick, computed, onMounted } from "vue";
import DashPlayer from "./DashPlayer.vue";
import { BACKEND_URL } from "@/main";
import ChatMainHeader from "./ChatMainHeader.vue";
import ChatInput from "./ChatInput.vue";

const props = defineProps({
  selectedRoom: Object,
  messages: Array,
  currentUser: Object,
  moreMessages: Boolean,
  isFetchingMore: Boolean,
  loadingMessages: Boolean,
});

const messagesContainer = ref(null);
const imageBlobs = ref(new Map());
const failedImageUrls = ref(new Set());
const loadingBlobs = ref(new Set());

const messageRefs = ref(new Map());
const scrollToMessageId = ref(null);

const visibleMessageIds = ref(new Set());
const hasScrolled = ref(false);

const enlargedImage = ref(null);
const hoveredImageId = ref(null);

function selectTempDmRoom(selectedUser) {
  emit("select-temp-dm-room", selectedUser);
}

function openImageEnlarged(imageUrl) {
  enlargedImage.value = imageUrl;
}

function closeImageEnlarged() {
  enlargedImage.value = null;
}

const groupedMessages = computed(() => {
  if (!props.messages.length) return [];

  const groups = [];
  let currentGroup = {
    sender: props.messages[0].sender,
    messages: [props.messages[0]],
  };

  for (let i = 1; i < props.messages.length; i++) {
    const msg = props.messages[i];
    if (msg.sender.username === currentGroup.sender.username) {
      currentGroup.messages.push(msg);
    } else {
      groups.push(currentGroup);
      currentGroup = {
        sender: msg.sender,
        messages: [msg],
      };
    }
  }

  groups.push(currentGroup);
  return groups;
});

const observer = new IntersectionObserver(
  async (entries) => {
    for (const entry of entries) {
      const messageId = entry.target.getAttribute("data-message-id");
      if (!messageId) continue;

      const msg = props.messages.find((m) => m.id === messageId);
      if (!msg) continue;

      if (entry.isIntersecting) {
        visibleMessageIds.value.add(messageId);

        if (
          msg.mediaUrl &&
          isImage(msg.mediaUrl) &&
          !imageBlobs.value.has(msg.mediaUrl) &&
          !loadingBlobs.value.has(msg.mediaUrl) &&
          !failedImageUrls.value.has(msg.mediaUrl)
        ) {
          loadingBlobs.value.add(msg.mediaUrl);
          try {
            const blobUrl = await fetchImageBlob(msg.mediaUrl);
            imageBlobs.value.set(msg.mediaUrl, blobUrl);
          } catch (e) {
            failedImageUrls.value.add(msg.mediaUrl);
          } finally {
            loadingBlobs.value.delete(msg.mediaUrl);
          }
        }
      } else {
        if (msg.mediaUrl && imageBlobs.value.has(msg.mediaUrl)) {
          URL.revokeObjectURL(imageBlobs.value.get(msg.mediaUrl));
          imageBlobs.value.delete(msg.mediaUrl);
        }
        visibleMessageIds.value.delete(messageId);
      }
    }
  },
  {
    root: messagesContainer.value,
    threshold: 0.01,
    rootMargin: "800px 800px 800px 800px",
    scrollMargin: "800px 800px 800px 800px",
  }
);

function scrollToBottom(el) {
  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight - el.clientHeight;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    });
  });
}

watch(
  () => props.messages,
  async (newMessages, oldMessages) => {
    await nextTick();

    const el = messagesContainer.value;
    if (!el) return;

    if (scrollToMessageId.value) {
      scrollToMessage(scrollToMessageId.value);
      scrollToMessageId.value = null;
    } else {
      const el = messagesContainer.value;
      if (!hasScrolled.value) {
        scrollToBottom(el);
        hasScrolled.value = true;
      }
      if (newMessages.length - oldMessages.length == 1) {
        const msg = newMessages[newMessages.length - 1];
        if (msg.sender.username === props.currentUser.username)
          scrollToBottom(el);
      }
    }
  }
);

watch(
  () => props.selectedRoom,
  async (oldRoom, newRoom) => {
    hasScrolled.value = false;
    if (oldRoom !== newRoom) {
      for (const [mediaUrl, blobUrl] in imageBlobs.value.entries()) {
        URL.revokeObjectURL(blobUrl);
      }
    }
  }
);

function setMessageRef(id) {
  return (el) => {
    if (el) {
      messageRefs.value.set(id, el);
      el.setAttribute("data-message-id", id);
      observer.observe(el);
    }
  };
}

function scrollToMessage(messageId) {
  const el = messageRefs.value.get(messageId);
  if (el) {
    el.scrollIntoView({ block: "start" });
  }
}

function isImage(url) {
  return /\.(jpeg|jpg|png|gif|webp|bmp)$/i.test(url);
}

function isDashVideo(url) {
  return /\.mpd$/i.test(url);
}

function formatTimestamp(timestamp, formal = false) {
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

  if (isToday && !formal) {
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

const emit = defineEmits([
  "send-message",
  "fetch-more-messages",
  "select-temp-dm-room",
]);

async function sendMessage(message) {
  emit("send-message", message);
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

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.relative {
  position: relative;
  display: inline-block;
}

.absolute {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 0.25rem; /* Match your image rounding */
}

.ql-toolbar {
  display: flex;
  border: 1px solid #ccc;
  border-radius: 2px;
}

.ql-toolbar .ql-formats button {
  color: #333;
  background: transparent;
  border: none;
  margin: 0 4px;
}

.ql-toolbar .ql-formats button:hover {
  background-color: #ddd;
}

.ql-toolbar .ql-formats .ql-active {
  background-color: #aaa;
  color: white;
}

.ql-editor {
  overflow-y: hidden; /* hides scrollbar, like scrollbar-hide */
  resize: none; /* disables manual resize */
  flex-grow: 1; /* flex-1 */
  color: #18181b; /* text-zinc-950 */
  border-radius: 0.5rem; /* rounded-lg (8px) */
  outline: none;
  box-shadow: none;
  min-height: 70px;
}
</style>
