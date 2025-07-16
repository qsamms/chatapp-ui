import { RepeatOneSharp } from "@mui/icons-material";
import router from "../router";
import { getCurrentUser } from "../utils/api";

export function logout() {
  localStorage.removeItem("token");
  router.push("/login");
}

export async function isTokenValid() {
  try {
    return (await getCurrentUser()).status == 200;
  } catch (err) {
    return false;
  }
}

export async function getCurrentUserObj() {
  try {
    const response = await getCurrentUser();
    return response.data;
  } catch (err) {
    return "";
  }
}
