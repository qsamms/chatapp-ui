import { throttle, update } from "lodash-es";
import { onBeforeUnmount, onMounted } from "vue";
import { logout } from "./auth";

const FIFTEEN_MINUTES_SECONDS = 15 * 60;

export function useAutoLogout() {
  const updateLastActive = throttle(() => {
    localStorage.setItem("lastActive", Date.now() / 1000);
  }, 10000);

  const checkLastActive = setInterval(() => {
    const lastActiveTimeFromEpochS = localStorage.getItem("lastActive");
    if (!lastActiveTimeFromEpochS) {
      return;
    }

    const nowTimeFromEpochS = Date.now() / 1000;
    if (
      nowTimeFromEpochS - lastActiveTimeFromEpochS >=
      FIFTEEN_MINUTES_SECONDS
    ) {
      logout();
    }
  }, 30000);

  onMounted(() => {
    window.addEventListener("mousemove", updateLastActive);
    window.addEventListener("mousedown", updateLastActive);
    updateLastActive();
  });

  onBeforeUnmount(() => {
    updateLastActive.cancel();
    window.removeEventListener("mousemove", updateLastActive);
    window.removeEventListener("mousedown", updateLastActive);
  });
}
