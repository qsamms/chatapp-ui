import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../components/LoginPage.vue";
import SignupPage from "../components/SignupPage.vue";
import ChatPage from "../components/ChatPage.vue";
import { isTokenValid } from "../utils/auth";

const routes = [
  { path: "/login", component: LoginPage },
  { path: "/signup", component: SignupPage },
  { path: "/chat", component: ChatPage, meta: { requiresAuth: true } },
  { path: "/", redirect: "/chat" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
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
