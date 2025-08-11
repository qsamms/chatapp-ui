<template>
  <div class="flex h-screen">
    <aside
      :class="[
        'transition-all duration-300 border-l border-zinc-300 text-zinc-950 flex flex-col relative w-60',
      ]"
    >
      <div class="flex px-4 py-2 mt-1 border-b-2 border-gray-200 py-4">
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
            <div v-if="participant.user.displayName" class="flex items-center">
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

      <BaseDialog v-model="isUserDialogOpen">
        <template #header>
          <div class="flex items-center">User Profile</div>
        </template>

        <div class="flex flex-col gap-4">
          <div>
            <div class="flex items-end">
              <div
                class="relative flex ml-2 mt-2 text-zinc-800 flex bg-slate-200 w-10 h-10 rounded-full items-center justify-center"
              >
                <div class="text-lg uppercase flex">
                  {{ selectedUser.user.firstName[0]
                  }}{{ selectedUser.user.lastName[0] }}
                </div>
                <div
                  class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                  :class="
                    isUserOnline(selectedUser.user.lastHeartbeat)
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  "
                ></div>
              </div>
              <div class="pl-2 text-lg flex flex-col pt-1">
                {{ selectedUser.user.firstName }}
                {{ selectedUser.user.lastName }}
                <div v-if="selectedUser.user.displayName" class="text-xs">
                  ({{ selectedUser.user.displayName }})
                </div>
              </div>
            </div>
            <div class="pl-2 text-md pt-4 text-zinc-500">
              <div class="flex items-center">
                <Mail class="w-4 h-4 mr-2"></Mail> {{ selectedUser.user.email }}
              </div>
            </div>
          </div>
          <div v-if="selectedUser.user.bio" class="flex flex-col pt-2">
            <div class="flex items-center">
              <User class="w-4 h-4 mr-1"></User>About
            </div>
            <textarea
              disabled
              v-model="selectedUser.user.bio"
              class="resize-none flex-1 p-3 text-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
            ></textarea>
          </div>
          <div class="flex gap-2">
            <button
              @click="clickSendDm(selectedUser.user)"
              class="text-sm flex w-full justify-center items-center text-zinc-950 mt-4 bg-slate-200 text-white py-1 px-4 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              <MessageCircle class="w-4 h-4 mr-2"></MessageCircle>Direct Message
            </button>
            <button
              v-if="pendingFriendRequest.id"
              @click="onClickAcceptFriendRequest()"
              class="text-sm flex items-center justify-center w-full mt-4 bg-zinc-700 hover:bg-zinc-950 text-white py-1 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              <Heart class="w-4 h-4 mr-2"></Heart>Accept Friend Request
            </button>
            <button
              v-else-if="isMyFriend(selectedUser.user)"
              @click="clickRemoveFriend()"
              class="text-sm flex items-center justify-center w-full mt-4 bg-zinc-700 hover:bg-zinc-950 text-white py-1 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              <Heart class="w-4 h-4 mr-2"></Heart>Remove Friend
            </button>
            <button
              v-else-if="haveSentFriendRequest()"
              disabled
              class="text-sm flex items-center justify-center w-full mt-4 bg-zinc-700 hover:bg-zinc-950 text-white py-1 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              <Heart class="w-4 h-4 mr-2"></Heart>Friend Request Sent
            </button>
            <button
              v-else
              @click="onClickSendFriendRequest()"
              class="text-sm flex items-center justify-center w-full mt-4 bg-zinc-700 hover:bg-zinc-950 text-white py-1 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              <Heart class="w-4 h-4 mr-2"></Heart>Add friend
            </button>
          </div>
        </div>
      </BaseDialog>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useParticipants } from "@/utils/useParticipants";
import BaseDialog from "./Dialog";
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  removeFriend,
} from "@/utils/api";

const props = defineProps({
  selectedRoom: Object,
  currentUser: Object,
});
const { participants } = useParticipants(() => props.selectedRoom);
const selectedUser = ref({});
const isUserDialogOpen = ref(false);
const pendingFriendRequest = ref({});
const myFriends = ref([]);
const pendingRequests = ref([]);
const sentRequests = ref([]);
const emit = defineEmits(["select-temp-dm-room"]);

onMounted(async () => {
  const response = await getFriends();
  myFriends.value = response.data.accepted;
  pendingRequests.value = response.data.pendingReceived;
  sentRequests.value = response.data.pendingSent;
});

function getNumActiveMembers() {
  let count = 0;
  if (participants) {
    for (const p of participants.value) {
      if (isUserOnline(p.user.lastHeartbeat)) count += 1;
    }
  }
  return count;
}

function isUserOnline(lastHeartbeat) {
  if (!lastHeartbeat) return false;

  const last = new Date(lastHeartbeat).getTime();
  const now = Date.now();
  const diff = now - last;

  return diff < 60_000;
}

async function reFetchFriends() {
  pendingFriendRequest.value = {};
  const response = await getFriends();
  myFriends.value = response.data.accepted;
  pendingRequests.value = response.data.pendingReceived;
  sentRequests.value = response.data.pendingSent;
  checkForPendingRequest();
}

async function onClickSendFriendRequest() {
  await sendFriendRequest(selectedUser.value.user.username);
  await reFetchFriends();
}

async function onClickAcceptFriendRequest() {
  await acceptFriendRequest(pendingFriendRequest.value.id);
  await reFetchFriends();
}

async function clickRemoveFriend() {
  const friendship = myFriends.value.find(
    (f) => f.friend.username === selectedUser.value.user.username
  );
  await removeFriend(friendship.id);
  await reFetchFriends();
}

function isMyFriend(user) {
  for (const friendship of myFriends.value) {
    if (friendship.friend.username === user.username) {
      return true;
    }
  }
  return false;
}

function haveSentFriendRequest() {
  for (const friendship of sentRequests.value) {
    if (friendship.receiver.username === selectedUser.value.user.username) {
      return true;
    }
  }
  return false;
}

function checkForPendingRequest() {
  for (const req of pendingRequests.value) {
    if (req.sender.username === selectedUser.value.user.username) {
      pendingFriendRequest.value = req;
    }
  }
}

async function onClickParticipant(participant) {
  if (participant.user.username === props.currentUser.username) return;
  selectedUser.value = participant;
  isUserDialogOpen.value = true;
  checkForPendingRequest();
}

function clickSendDm(selectedUser) {
  isUserDialogOpen.value = false;
  emit("select-temp-dm-room", selectedUser);
}
</script>
