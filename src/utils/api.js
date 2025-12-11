import { api } from "../main";

export async function login(username, password) {
  return await api.post("/auth/login/", { username, password });
}

export async function signup(email, firstName, lastName, password) {
  return await api.post("/auth/signup/", {
    email,
    firstName,
    lastName,
    password,
  });
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
  const response = await api.get(mediaUrl, {
    responseType: "blob",
  });
  return URL.createObjectURL(response.data);
}

export async function sendHeartbeat() {
  const response = await api.get("/heartbeat/");
  return response;
}

export async function getParticipants(roomId) {
  const response = await api.get(`rooms/${roomId}/participants/`);
  return response;
}

export async function sendFriendRequest(username) {
  return await api.post("/friendships/send/", { username });
}

export async function getFriends() {
  return await api.get("/friendships/");
}

export async function acceptFriendRequest(id) {
  return await api.post(`/friendships/accept/${id}/`);
}

export async function deleteFriendRequest(id) {
  return await api.delete(`/friendships/${id}/`);
}

export async function getPendingRequests() {
  return await api.get("/friendships/pending-received/");
}

export async function removeFriend(id) {
  return await api.delete(`/friendships/${id}/`);
}

export async function searchText(text) {
  const response = await api.post("/search/", { text });
  return response;
}
