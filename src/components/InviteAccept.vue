<template>
  <div class="invite-accept">
    <p v-if="loading">Joining room...</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { joinRoom } from "@/utils/api";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  const inviteId = route.params.inviteId;

  try {
    const roomId = (await joinRoom(inviteId)).data.roomId;
    router.push(`/chat/${roomId}`);
  } catch (e) {
    error.value = "Failed to join chat room. Invite may be invalid or expired.";
  } finally {
    loading.value = false;
  }
});
</script>
