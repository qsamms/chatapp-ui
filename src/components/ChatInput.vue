<template>
  <div
    v-if="files && files.length > 0"
    class="w-full flex flex-col justify-center px-2 pt-2 border-t-2 border-zinc-300"
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
    class="w-full flex items-center pl-2 pr-2 pt-4 pb-4 border-t-2 border-zinc-300"
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
    <div
      class="scrollbar-hide resize-none flex-1 p-3 text-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
    >
      <QuillEditor
        ref="editorRef"
        @update:content="(val) => (newMessage = val)"
        theme="snow"
        :content="newMessage"
        contentType="html"
        :placeholder="`Message ${selectedRoom.name}...`"
        :modules="modules"
      ></QuillEditor>
    </div>

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
</template>

<script setup>
import { uploadFiles } from "@/utils/api";
import { ref, onMounted } from "vue";
import { QuillEditor } from "@vueup/vue-quill";

const props = defineProps({
  selectedRoom: Object,
  loadingMessages: Boolean,
  files: Array,
  newMessage: String,
  isSending: Boolean,
});

const emit = defineEmits(["send-message"]);

const newMessage = ref("");
const isSending = ref(false);
const files = ref([]);
const editorRef = ref(null);
const fileInput = ref(null);

function triggerFileInput() {
  fileInput.value.click();
}

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

function handleFileChange(event) {
  const selectedFiles = event.target.files;
  if (!selectedFiles || selectedFiles.length === 0) return;

  files.value = Array.from(selectedFiles);
  event.target.value = null;
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
  if (props.selectedRoom.dm) {
    const targetUser = props.selectedRoom
      ? props.selectedRoom.otherParticipant
      : null;
    emit("send-message", {
      message: { content: newMessage.value, mediaUrl: mediaUrl },
      targetUser,
    });
  } else {
    emit("send-message", {
      message: { content: newMessage.value, mediaUrl: mediaUrl },
      targetUser: null,
    });
  }
  newMessage.value = "";
  files.value = [];
  isSending.value = false;
}

onMounted(() => {
  const quill = editorRef.value;
  if (!quill) return;

  quill.editor.__quill.keyboard.bindings[13].unshift({
    key: 13,
    handler: (range, context) => {
      sendMessage();
      return false;
    },
  });
});
</script>
