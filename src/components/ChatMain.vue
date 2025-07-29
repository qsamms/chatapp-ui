<template>
  <main class="w-full flex-1 pt-4 flex flex-col overflow-hidden">
    <h3
      class="w-full flex items-center justify-between text-lg text-zinc-950 font-semibold text-left border-b-2 border-zinc-300 pb-4 pl-4"
    >
      <div class="flex items-center">
        <Hash class="w-6 h-6 bg-slate-200 rounded-md p-1 mr-2"></Hash>
        {{ selectedRoom.name }}
      </div>

      <div
        v-if="participants.length"
        class="relative inline-block"
        @click="toggleMembers"
      >
        <div class="flex mr-4 hover:bg-gray-200 rounded-lg p-2">
          <div class="pr-2">
            {{ participants.length }}
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
            <div
              class="ml-auto text-sm text-right border-2 border-gray-200 rounded-xl px-2"
            >
              {{ getNumActiveMembers() }} Online
            </div>
          </div>
          <ul class="text-sm text-zinc-950 p-2 overflow-auto max-h-50">
            <li
              v-for="participant in participants"
              :key="participant.id"
              class="pl-2 py-2 truncate hover:bg-gray-100 rounded-md flex items-center text-md"
              :class="[
                participant.user.username !== currentUser.username
                  ? 'cursor-pointer'
                  : '',
              ]"
              @click="onClickParticipant(participant)"
            >
              <div class="flex items-center">
                <div
                  class="relative flex text-zinc-800 bg-slate-200 w-8 h-8 rounded-full items-center justify-center mr-2"
                >
                  <div
                    v-if="participant.user.displayName"
                    class="uppercase font-semibold"
                  >
                    {{ participant.user.displayName[0] }}
                  </div>
                  <div v-else class="uppercase font-semibold">
                    {{ participant.user.firstName[0]
                    }}{{ participant.user.lastName[0] }}
                  </div>
                  <div
                    class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                    :class="
                      isUserOnline(participant.user.lastHeartbeat)
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    "
                  ></div>
                </div>
                <div
                  v-if="participant.user.displayName"
                  class="flex items-center"
                >
                  {{ participant.user.displayName }}
                  <div
                    v-if="participant.user.username === currentUser.username"
                    class="pl-2"
                  >
                    (You)
                  </div>
                </div>
                <div v-else class="flex items-center">
                  {{ participant.user.firstName }}
                  {{ participant.user.lastName }}
                  <div
                    v-if="participant.user.username === currentUser.username"
                    class="pl-2"
                  >
                    (You)
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </Popover>
      </div>
    </h3>

    <div
      v-if="currentUser && !loadingMessages && messages.length > 0"
      ref="messagesContainer"
      class="flex-1 overflow-y-auto min-w-0"
      @scroll="onScroll"
    >
      <div class="flex flex-col justify-end min-h-full space-y-2">
        <div
          v-for="(group, groupIndex) in groupedMessages"
          :key="groupIndex"
          class="flex flex-col p-4 border-b border-gray-200 last:border-b-0 text-zinc-950"
        >
          <div class="flex items-start">
            <!-- Only show avatar for first message in group -->
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
            <!-- Empty spacer when avatar is hidden -->
            <div v-else class="w-9 h-9 mr-2 flex-shrink-0"></div>

            <div class="min-w-0 break-words w-full">
              <!-- Only show sender info for first message in group -->
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
                <div class="pt-1 text-left whitespace-pre-wrap break-words">
                  {{ msg.content }}
                </div>
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
      <div class="flex flex-col items-center">
        <MessagesSquare class="mb-4 w-8 h-8"></MessagesSquare>
        Nothing yet, break the ice?
      </div>
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
          class="flex p-2 rounded-lg bg-gray-200 items-center max-w-48 flex-shrink-0"
        >
          <File class="w-8 h-8 pr-2 flex-shrink-0"></File>
          <div class="flex flex-col flex-grow min-w-0">
            <div
              class="font-semibold text-zinc-950 whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {{ file.name }}
            </div>
            <div class="text-xs text-zinc-600">
              {{ formatFileSize(file.size) }}
            </div>
          </div>
          <X
            class="ml-2 w-4 h-4 hover:text-red-400 hover:cursor-pointer flex-shrink-0"
            @click="removeFile(file.name)"
          ></X>
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
  <BaseDialog v-model="isUserDialogOpen">
    <template #header>
      <div class="flex">User Info</div>
    </template>

    <div class="flex flex-col gap-2">
      <div>
        <div class="flex items-center align-center">
          <div
            class="relative flex ml-2 mt-2 text-zinc-800 flex bg-slate-200 w-10 h-10 rounded-full items-center justify-center"
          >
            <div class="text-lg uppercase flex">
              {{ selectedUser.firstName[0] }}{{ selectedUser.lastName[0] }}
            </div>
            <div
              class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
              :class="
                isUserOnline(selectedUser.lastHeartbeat)
                  ? 'bg-green-500'
                  : 'bg-gray-400'
              "
            ></div>
          </div>
          <div class="pl-2 text-lg flex">
            {{ selectedUser.firstName }} {{ selectedUser.lastName }}
            <div v-if="selectedUser.displayName" class="pl-2">
              ({{ selectedUser.displayName }})
            </div>
          </div>
        </div>
        <div class="pl-2 text-md pt-4 text-zinc-500">
          {{ selectedUser.email }}
        </div>
      </div>
      <div v-if="selectedUser.bio" class="flex flex-col pt-2">
        <textarea
          disabled
          v-model="selectedUser.bio"
          class="resize-none flex-1 p-3 text-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
        ></textarea>
      </div>
    </div>
  </BaseDialog>

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
import { uploadFiles, fetchImageBlob } from "@/utils/api";
import { ref, watch, nextTick, computed } from "vue";
import DashPlayer from "./DashPlayer.vue";
import { BACKEND_URL } from "@/main";
import { useParticipants } from "@/utils/useParticipants";
import BaseDialog from "./Dialog.vue";

const props = defineProps({
  selectedRoom: Object,
  messages: Array,
  currentUser: Object,
  moreMessages: Boolean,
  isFetchingMore: Boolean,
});

const { participants } = useParticipants(props.selectedRoom.id);

const isUserDialogOpen = ref(false);
const selectedUser = ref({});
const messagesContainer = ref(null);
const textAreaRef = ref(null);
const op = ref(null);
const fileInput = ref(null);
const files = ref([]);
const imageBlobs = ref(new Map());
const failedImageUrls = ref(new Set());
const loadingBlobs = ref(new Set());
const isSending = ref(false);

const messageRefs = ref(new Map());
const scrollToMessageId = ref(null);

const visibleMessageIds = ref(new Set());
const hasScrolled = ref(false);

const enlargedImage = ref(null);
const hoveredImageId = ref(null);

function openImageEnlarged(imageUrl) {
  enlargedImage.value = imageUrl;
}

function closeImageEnlarged() {
  enlargedImage.value = null;
}

function onClickParticipant(participant) {
  if (participant.user.username === props.currentUser.username) return;
  selectedUser.value = participant.user;
  isUserDialogOpen.value = true;
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

async function removeFile(fileName) {
  console.log(files.value);
  let newFiles = [];

  for (const file of files.value) {
    if (file.name !== fileName) {
      newFiles.push(file);
    }
  }

  console.log(newFiles);

  files.value = newFiles;
}

function formatFileSize(size) {
  const fileSizeMB = Math.round((size / 1000 / 1000) * 10) / 10;
  if (fileSizeMB > 0) {
    return `${fileSizeMB} MB`;
  } else {
    const fileSizeKB = Math.round((size / 1000) * 10) / 10;
    return `${fileSizeKB} KB`;
  }
}

function shouldShowAvatar(index) {
  if (index === 0) return true;
  return (
    props.messages[index].sender.username !==
    props.messages[index - 1].sender.username
  );
}

function isUserOnline(lastHeartbeat) {
  if (!lastHeartbeat) return false;

  const last = new Date(lastHeartbeat).getTime();
  const now = Date.now();
  const diff = now - last;

  return diff < 60_000;
}

function getNumActiveMembers() {
  let count = 0;
  for (const p of participants.value) {
    if (isUserOnline(p.user.lastHeartbeat)) count += 1;
  }
  return count;
}

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

function autoResize() {
  const el = textAreaRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

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
  const selectedFiles = event.target.files;
  if (!selectedFiles || selectedFiles.length === 0) return;

  files.value = Array.from(selectedFiles);
  event.target.value = null;
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
</style>
