import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import { getParticipants } from "./api";

export function useParticipants(roomGetter, intervalMs = 5000) {
  let interval = null;

  const participants = ref([]);

  async function fetchParticipants() {
    if (roomGetter().dm && roomGetter().isTempDm) return;
    const response = await getParticipants(roomGetter().id);
    participants.value = response.data;
  }

  onMounted(() => {
    fetchParticipants();
    interval = setInterval(fetchParticipants, intervalMs);
  });

  onBeforeUnmount(() => {
    if (interval) {
      clearInterval(interval);
    }
  });

  watch(
    roomGetter,
    () => {
      fetchParticipants();
    },
    { immediate: true }
  );

  return {
    participants,
  };
}
