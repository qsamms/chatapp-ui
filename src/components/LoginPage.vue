<template>
  <div class="flex justify-center items-center">
    <Card class="w-1/2 max-w-lg shadow-2xl">
      <template #title>
        <div class="pb-2 text-xl font-semibold text-center">Login</div>
      </template>
      <template #content>
        <Form @submit="login" class="flex flex-col gap-4">
          <div class="flex flex-col">
            <label for="Username" class="text-left">Username</label>
            <InputText id="username" v-model="username" />
          </div>
          <div class="flex flex-col">
            <label for="Username" class="text-left">Password</label>
            <Password v-model="password" toggleMask :feedback="false" fluid />
          </div>
          <Button label="Login" type="submit" class="w-full"></Button>
        </Form>
        <Message v-if="error" severity="error" class="mt-4 text-sm">
          {{ error }}
        </Message>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import router from "../router";

const username = ref("");
const password = ref("");
const error = ref("");

async function login() {
  if (!username.value || !password.value) {
    error.value = "Username and password are required.";
    return;
  }
  try {
    const response = await axios.post("/auth/login/", {
      username: username.value,
      password: password.value,
    });
    localStorage.setItem("token", response.data.token);
    router.push("/chat");
  } catch (err) {
    error.value = "Login failed";
  }
}
</script>
