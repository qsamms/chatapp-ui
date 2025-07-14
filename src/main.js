import { createApp } from "vue";
import axios from "axios";
import PrimeVue from "primevue/config";

import App from "./App.vue";
import router from "./router";
import Aura from "@primeuix/themes/aura";

import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Password from "primevue/password";
import Card from "primevue/card";
import Message from "primevue/message";
import IftaLabel from "primevue/iftalabel";
import { FloatLabel } from "primevue";
import { Form } from "@primevue/forms";

import "./index.css";

axios.defaults.baseURL = "http://localhost:8080";

axios.interceptors.response.use(
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
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});

/* eslint-disable vue/multi-word-component-names */
app.component("Button", Button);
app.component("Password", Password);
app.component("Card", Card);
app.component("Message", Message);
app.component("InputText", InputText);
app.component("IftaLabel", IftaLabel);
app.component("FloatLabel", FloatLabel);
app.component("Form", Form);

app.mount("#app");
