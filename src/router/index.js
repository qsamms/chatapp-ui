import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../components/LoginPage.vue";
import SignupPage from "../components/SignupPage.vue";
import ChatPage from "../components/ChatPage.vue";
import { isTokenValid } from "../utils/auth";
import { MessageSquareText, Users, User } from "lucide-vue-next";
import InviteAccept from "@/components/InviteAccept.vue";

const routes = [
  { path: "/login", component: LoginPage, meta: { title: "Chat | Login" } },
  { path: "/signup", component: SignupPage, meta: { title: "Chat | Sign up" } },
  {
    path: "/chat/:roomId?",
    component: ChatPage,
    meta: { requiresAuth: true, title: "Chat | Rooms" },
  },
  { path: "/", redirect: "/chat" },
  { path: "/rooms/join/:inviteId", component: InviteAccept },
];

export const navItems = [
  { name: "chat", label: "Chat Rooms", icon: MessageSquareText },
  { name: "friends", label: "Friends", icon: Users },
  { name: "profile", label: "Profile", icon: User },
];

export function onClickNavigate(path) {
  router.push(path);
}

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const defaultTitle = "Chat";
  document.title = to.meta.title || defaultTitle;
  const requiresAuth = to.meta.requiresAuth;
  const token = localStorage.getItem("token");
  try {
    const valid = await isTokenValid(token);
    if (requiresAuth && !valid) {
      next("/login");
    } else if ((to.path === "/login" || to.path === "/signup") && valid) {
      next("/chat");
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    next("/login");
  }
});

export default router;
