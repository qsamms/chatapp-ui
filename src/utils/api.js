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
