import { onMounted, onBeforeUnmount } from "vue";
import { sendHeartbeat } from "./api";

export function useHeartbeat(intervalMs = 10000) {
  let heartbeatInterval = null;

  onMounted(() => {
    sendHeartbeat();
    heartbeatInterval = setInterval(sendHeartbeat, intervalMs);
  });

  onBeforeUnmount(() => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
  });
}
