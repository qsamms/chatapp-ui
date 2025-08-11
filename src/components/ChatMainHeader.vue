<template>
  <h3
    class="w-full flex items-center justify-between text-lg text-zinc-950 font-semibold text-left border-b-2 border-zinc-300 pb-4 pl-4"
  >
    <div v-if="selectedRoom && !selectedRoom.dm" class="flex items-center">
      <Hash class="w-6 h-6 bg-slate-200 rounded-md p-1 mr-2"></Hash>
      {{ selectedRoom.name }}
    </div>
    <div v-else-if="selectedRoom && selectedRoom.dm" class="flex items-center">
      <User class="w-6 h-6 bg-slate-200 rounded-md p-1 mr-2"></User>
      <div v-if="selectedRoom.otherParticipant.displayName">
        {{ selectedRoom.otherParticipant.displayName }}
      </div>
      <div v-else>
        {{ selectedRoom.otherParticipant.firstName }}
        {{ selectedRoom.otherParticipant.lastName }}
      </div>
    </div>
  </h3>
</template>

<script setup>
const props = defineProps({
  selectedRoom: Object,
});
</script>
