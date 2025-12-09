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
    class="w-full flex items-center p-2 border-t-2 border-zinc-300"
  >
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      @change="handleFileChange"
      accept="image/*, video/*"
      :multiple="false"
    />
    <div class="relative flex-1">
      <QuillEditor
        v-model:content="newMessage"
        ref="editorRef"
        theme="snow"
        contentType="html"
        :placeholder="getRoomName(selectedRoom)"
        :toolbar="[
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['code', 'code-block'],
        ]"
        class="quill-editor"
      ></QuillEditor>
      <button
        @click="sendMessage"
        class="send-button"
        :disabled="isSending"
        aria-label="Send message"
      >
        <LoaderCircle
          v-if="isSending"
          class="w-6 h-6 animate-spin"
        ></LoaderCircle>
        <Send v-else class="w-6 h-6"></Send>
      </button>
    </div>
  </div>
</template>

<script setup>
import { uploadFiles } from "@/utils/api";
import { ref, onMounted, watch } from "vue";
import { QuillEditor, Quill } from "@vueup/vue-quill";

const icons = Quill.import("ui/icons");

const codeBlockSVG = `
<svg
  width="24px"
  height="24px"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  preserveAspectRatio="xMidYMid meet"
  style="display: block; margin: auto;"
>
  <path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V7h16l.002 12H4z"/>
  <path d="M9.293 9.293 5.586 13l3.707 3.707 1.414-1.414L8.414 13l2.293-2.293zm5.414 0-1.414 1.414L15.586 13l-2.293 2.293 1.414 1.414L18.414 13z"/>
</svg>
`;
icons["code-block"] = codeBlockSVG;

const props = defineProps({
  selectedRoom: Object,
  loadingMessages: Boolean,
});

const emit = defineEmits(["send-message"]);

const newMessage = ref("");
const isSending = ref(false);
const files = ref([]);
const editorRef = ref(null);
const fileInput = ref(null);

function getRoomName(room) {
  if (room.dm) {
    if (room.otherParticipant.displayName) {
      return `Message ${room.otherParticipant.displayName} ...`;
    } else {
      return `Message ${room.otherParticipant.firstName} ${room.otherParticipant.lastName} ...`;
    }
  } else {
    return `Message ${room.name} ...`;
  }
}

watch(
  () => props.selectedRoom,
  (newRoom) => {
    if (!editorRef.value) return;

    const quill = editorRef.value.editor.__quill;
    if (!quill) return;

    const editorElem = quill.root;
    if (editorElem) {
      editorElem.setAttribute("data-placeholder", getRoomName(newRoom));
    }
  },
  { immediate: true }
);

function triggerFileInput() {
  console.log("triggered");
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

function clearQuillEditor() {
  if (!editorRef.value) return;
  const quill = editorRef.value.editor.__quill;
  if (!quill) return;

  quill.root.innerHTML = "";
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

async function sendMessage() {
  const plainText = stripHtml(newMessage.value).trim();

  if (plainText === "" && files.value.length === 0) {
    return;
  }

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
  clearQuillEditor();
  files.value = [];
  isSending.value = false;
}

onMounted(() => {
  let quill = editorRef.value;
  if (!quill) return;

  console.log(quill);

  quill.editor.__quill.keyboard.bindings[13].unshift({
    key: 13,
    handler: (range, context) => {
      sendMessage();
      return false;
    },
  });

  const quillWrapper = editorRef.value;
  if (!quillWrapper) return;

  quill = quillWrapper.editor.__quill;
  if (!quill) return;

  const toolbar = quill.getModule("toolbar");
  if (!toolbar) return;

  toolbar.handlers.image = () => {
    triggerFileInput();
  };
});
</script>

<style>
.relative.flex-1 {
  min-width: 0; /* critical for flex children to wrap/shrink */
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

.ql-snow.ql-toolbar button {
  padding-left: 2px !important ;
  width: 28px !important;
  height: 28px !important;
}

.ql-toolbar .ql-formats button:hover {
  background-color: #ddd;
}

.ql-toolbar .ql-formats .ql-active {
  background-color: #aaa;
  color: white;
}

.ql-editor {
  font-size: 16px;
  resize: none; /* disables manual resize */
  flex-grow: 1; /* flex-1 */
  color: #18181b; /* text-zinc-950 */
  min-height: 70px;
  max-height: 400px;
  padding-right: 50px;
  padding-bottom: 50px;
}

.quill-editor {
  padding-right: 50px;
  min-height: 130px;
  max-height: 250px;
  overflow-y: auto;
  padding-bottom: 40px;
  width: 100%;
  box-sizing: border-box;
}

/* Position send button at bottom right inside the editor container */
.send-button {
  position: absolute;
  bottom: 8px;
  right: 20px;
  height: 36px;
  width: 36px;
  border-radius: 6px;
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #18181b; /* zinc-950 */
  transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
  background-color: #27272a; /* zinc-800 */
  color: white;
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
