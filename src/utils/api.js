import { api } from "../main";

export async function login(username, password) {
  return await api.post("/auth/login/", { username, password });
}

export async function signup(email, username, password) {
  return await api.post("/auth/signup/", { email, username, password });
}

export async function getCurrentUser() {
  return await api.get("/user/me/");
}

export async function updateUser(data) {
  return await api.post("/user/me/", data);
}

export async function getChatRooms() {
  return await api.get("/rooms/");
}

export async function getMessages(chatRoomId, before) {
  const body = before ? { before } : {};
  return await api.post(`/rooms/${chatRoomId}/messages/`, body);
}

export async function createChatRoom(name) {
  return await api.post("/rooms/", { name });
}

export async function getFriends() {
  return await api.get("/friendships/accepted/");
}

export async function getChatRoomInviteLink(chatRoomId) {
  return await api.get(`/rooms/${chatRoomId}/invite-link/`);
}

export async function joinRoom(inviteId) {
  return await api.post(`/rooms/join/${inviteId}/`);
}

export async function uploadFiles(formData) {
  return await api.post("/media/upload/", formData);
}

export async function fetchImageBlob(mediaUrl) {
  try {
    const response = await api.get(mediaUrl, {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error fetching image:", error);
  }
}
