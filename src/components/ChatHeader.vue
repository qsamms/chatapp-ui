<template>
  <div
    class="flex h-16 dark:bg-gray-100 border-b dark:border-zinc-300 relative"
    ref="wrapper"
  >
    <div id="spacer-left" class="w-80"></div>

    <div class="flex flex-1 items-center justify-center relative">
      <div class="relative w-1/2">
        <Search
          class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
        />
        <input
          type="text"
          v-model="text"
          placeholder="Search across all channels"
          class="pl-8 p-2 w-full h-10 border border-zinc-400 rounded-md text-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keydown.enter="search"
        />

        <ul
          v-if="hits.length"
          class="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-zinc-300 rounded-sm shadow-lg"
        >
          <li
            v-for="(hit, index) in hits"
            :key="hit.id"
            class="pl-2 py-2 truncate hover:border-zinc-900 hover:border rounded-md flex flex-col border-t border-zinc-300 cursor-pointer text-zinc-950"
            :class="index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'"
            @click="onClickRoom({ room: hit.room, targetMessage: hit })"
          >
            <div class="flex items-center mb-1">
              <!-- Avatar -->
              <div
                class="relative flex-shrink-0 flex items-center justify-center w-8 h-8 bg-slate-200 rounded-full mr-2 text-zinc-800 font-semibold"
              >
                <div v-if="hit.user?.displayName">
                  {{ hit.user.displayName[0] }}
                </div>
                <div v-else-if="hit.user">
                  {{ hit.user.firstName[0] }}{{ hit.user.lastName[0] }}
                </div>
                <div v-else>?</div>

                <div
                  class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                  :class="
                    hit.user?.lastHeartbeat &&
                    isUserOnline(hit.user.lastHeartbeat)
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  "
                />
              </div>

              <!-- Name and room info -->
              <div class="flex flex-col justify-start">
                <span class="font-semibold text-left">
                  {{ hit.user?.firstName || "Unknown" }}
                  {{ hit.user?.lastName || "" }}
                </span>
                <span class="text-sm text-zinc-600 text-left"
                  ># {{ hit.room.name }}</span
                >
              </div>
            </div>

            <!-- Message -->
            <div class="text-sm text-zinc-800 text-left pl-8 pt-2">
              <span v-html="hit.text"></span>
            </div>
          </li>
        </ul>

        <ul
          v-if="noresults"
          class="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-zinc-300 rounded-sm shadow-lg"
        >
          <li
            :key="notfound"
            class="pl-2 py-2 truncate hover:border rounded-md flex flex-col border-t border-zinc-300 cursor-pointer text-zinc-950"
          >
            <div class="flex items-center mb-1">No results</div>
          </li>
        </ul>
      </div>
    </div>

    <div id="spacer-right" class="w-60"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { searchText } from "@/utils/api";
import { isUserOnline } from "@/utils/utils";

const props = defineProps({
  currentUser: Object,
});

const emit = defineEmits(["select-room"]);

const text = ref("");
const hits = ref([]);
const wrapper = ref(null);
const noresults = ref(false);

async function search() {
  const response = await searchText(text.value);
  hits.value = response.data.hits || [];
  if (hits.value.length === 0) noresults.value = true;
}

function handleClickOutside(event) {
  if (wrapper.value && !wrapper.value.contains(event.target)) {
    hits.value = [];
    noresults.value = false;
    text.value = "";
  }
}

function onClickRoom({ room, targetMessage }) {
  emit("select-room", room, null, targetMessage);
  hits.value = [];
  text.value = "";
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
