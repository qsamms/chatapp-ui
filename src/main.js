import { createApp } from "vue";
import axios from "axios";
import PrimeVue from "primevue/config";

import App from "./App.vue";
import router from "./router";
import Aura from "@primeuix/themes";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Password from "primevue/password";
import Card from "primevue/card";
import Message from "primevue/message";
import { Popover } from "primevue";
import { Form } from "@primevue/forms";
import Dialog from "primevue/dialog";
import Avatar from "primevue/avatar";

import { EyeOff, MessageCircle, User, Users } from "lucide-vue-next";
import { MessageSquarePlus } from "lucide-vue-next";
import { MailPlus } from "lucide-vue-next";
import { ArrowLeft } from "lucide-vue-next";
import { ArrowRight } from "lucide-vue-next";
import { MessageSquareText } from "lucide-vue-next";
import { Plus } from "lucide-vue-next";
import { UserPlus } from "lucide-vue-next";
import { Hash } from "lucide-vue-next";
import { Send } from "lucide-vue-next";
import { Settings } from "lucide-vue-next";
import { Eye } from "lucide-vue-next";
import { X } from "lucide-vue-next";
import { Copy } from "lucide-vue-next";
import { LogOut } from "lucide-vue-next";

import "./index.css";

export const BACKEND_URL =
  import.meta?.env?.BACKNED_URL || "http://localhost:8080";

export const FE_URL = import.meta.env?.FRONTEND_URL || "http://localhost:8081";

export const api = axios.create({
  baseURL: BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const isAuthRoute = config.url?.startsWith("/auth/");
  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

const app = createApp(App);

app.use(router);
app.use(PrimeVue, { theme: { preset: Aura } });
app.mount("#app");

/* eslint-disable vue/multi-word-component-names */
app.component("Button", Button);
app.component("Password", Password);
app.component("Card", Card);
app.component("Message", Message);
app.component("InputText", InputText);
app.component("Form", Form);
app.component("Dialog", Dialog);
app.component("Popover", Popover);
app.component("Avatar", Avatar);

app.component("UserIcon", User);
app.component("AddChatRoom", MessageSquarePlus);
app.component("MailPlus", MailPlus);
app.component("ArrowLeft", ArrowLeft);
app.component("ArrowRight", ArrowRight);
app.component("MessageSquareText", MessageSquareText);
app.component("Plus", Plus);
app.component("UserPlus", UserPlus);
app.component("Hash", Hash);
app.component("MessageCircle", MessageCircle);
app.component("Send", Send);
app.component("Settings", Settings);
app.component("Eye", Eye);
app.component("EyeOff", EyeOff);
app.component("X", X);
app.component("Copy", Copy);
app.component("Users", Users);
app.component("Logout", LogOut);
