import axios from "axios";
import router from "../router";

export function logout() {
  localStorage.removeItem("token");
  router.push("/login");
}

export async function isTokenValid() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await axios.get("/user/me/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return !!response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      return false;
    }
    throw err;
  }
}

export async function getCurrentUserUsername() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await axios.get("/user/me/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return !!response.data.username;
  } catch (err) {
    if (err.response?.status === 401) {
      return false;
    }
    throw err;
  }
}
