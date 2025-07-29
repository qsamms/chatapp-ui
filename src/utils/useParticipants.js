import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import { getParticipants } from "./api";

export function useParticipants(roomIdGetter, intervalMs = 5000) {
  let interval = null;

  const participants = ref([]);

  async function fetchParticipants() {
    const response = await getParticipants(roomIdGetter());
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
    roomIdGetter,
    () => {
      fetchParticipants();
    },
    { immediate: true }
  );

  return {
    participants,
  };
}
