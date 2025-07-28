import { onMounted, onBeforeUnmount, ref } from "vue";
import { getParticipants } from "./api";

export function useParticipants(roomId, intervalMs = 5000) {
  let interval = null;

  const participants = ref([]);

  async function fetchParticipants() {
    const response = await getParticipants(roomId);
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

  return {
    participants,
  };
}
