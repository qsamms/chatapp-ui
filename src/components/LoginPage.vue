<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
    <Card
      class="w-full max-w-md p-6 bg-white rounded-lg shadow-xl border border-zinc-200"
    >
      <template #title>
        <div class="text-3xl font-extrabold text-zinc-800 text-center mb-6">
          Welcome Back!
        </div>
      </template>
      <template #content>
        <Form @submit="onClickLogin" class="flex flex-col w-full gap-5">
          <div class="flex flex-col">
            <label
              for="username"
              class="text-left text-sm font-medium text-zinc-700 mb-2"
              >Email</label
            >
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your email"
              class="text-zinc-500 p-3 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition duration-150 ease-in-out"
            />
          </div>

          <div class="flex flex-col relative align-center">
            <label
              for="password"
              class="text-left text-sm font-medium text-zinc-700 mb-2"
              >Password</label
            >
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="Enter your password"
                class="w-full p-3 pr-10 text-zinc-500 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition duration-150 ease-in-out"
              />
              <button
                type="button"
                @click="toggleShowPassword"
                class="absolute right-0 top-0 bottom-0 px-3 flex items-center text-zinc-500 hover:text-zinc-700 focus:outline-none"
              >
                <Eye v-if="!showPassword" class="h-5 w-5"></Eye>
                <EyeOff v-else class="h-5 w-5"></EyeOff>
              </button>
            </div>
          </div>
          <button
            type="submit"
            class="w-full mt-4 bg-zinc-700 text-white py-3 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-lg"
          >
            Log In
          </button>
        </Form>
        <Message
          v-if="error"
          severity="error"
          class="mt-6 text-sm text-red-700 bg-red-50 border-red-200 rounded-md p-3"
        >
          {{ error }}
        </Message>
      </template>
      <template #footer>
        <div class="text-center mt-6 text-zinc-600 text-sm">
          Don't have an account?
          <a href="/signup" class="text-zinc-700 hover:underline font-semibold"
            >Sign Up</a
          >
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import router from "../router";
import { login } from "@/utils/api";

const username = ref("");
const password = ref("");
const error = ref("");
const showPassword = ref(false);

async function onClickLogin() {
  if (!username.value || !password.value) {
    error.value = "Username and password are required.";
    return;
  }
  try {
    const response = await login(username.value, password.value);
    localStorage.setItem("token", response.data.token);
    router.push("/chat");
  } catch (err) {
    console.log(err);
    error.value = "Login failed";
  }
}

function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}
</script>
