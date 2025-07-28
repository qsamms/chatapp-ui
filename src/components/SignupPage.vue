<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
    <Card class="w-full max-w-md p-6 rounded-lg border-2 border-zinc-300">
      <template #title>
        <div class="text-3xl font-extrabold text-zinc-800 text-center mb-6">
          Sign Up
        </div>
      </template>
      <template #content>
        <Form @submit="onClickSignup" class="flex flex-col gap-4">
          <div class="flex flex-col">
            <label class="text-left">Email</label>
            <input
              v-model="email"
              required
              class="text-zinc-500 p-3 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition duration-150 ease-in-out"
            />
          </div>
          <div class="flex flex-col">
            <label class="text-left">First Name</label>
            <input
              v-model="firstName"
              required
              class="text-zinc-500 p-3 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition duration-150 ease-in-out"
            />
          </div>
          <div class="flex flex-col">
            <label class="text-left">Last Name</label>
            <input
              v-model="lastName"
              required
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
                :type="showPassword1 ? 'text' : 'password'"
                id="password"
                v-model="password1"
                placeholder="Enter your password"
                class="w-full p-3 pr-10 text-zinc-500 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition duration-150 ease-in-out"
              />
              <button
                type="button"
                @click="toggleShowPassword1"
                class="absolute right-0 top-0 bottom-0 px-3 flex items-center text-zinc-500 hover:text-zinc-700 focus:outline-none"
              >
                <Eye v-if="!showPassword1" class="h-5 w-5"></Eye>
                <EyeOff v-else class="h-5 w-5"></EyeOff>
              </button>
            </div>
          </div>
          <div class="flex flex-col relative align-center">
            <label
              for="password"
              class="text-left text-sm font-medium text-zinc-700 mb-2"
              >Password</label
            >
            <div class="relative">
              <input
                :type="showPassword2 ? 'text' : 'password'"
                id="password"
                v-model="password2"
                placeholder="Verify Password"
                class="w-full p-3 pr-10 text-zinc-500 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition duration-150 ease-in-out"
              />
              <button
                type="button"
                @click="toggleShowPassword2"
                class="absolute right-0 top-0 bottom-0 px-3 flex items-center text-zinc-500 hover:text-zinc-700 focus:outline-none"
              >
                <Eye v-if="!showPassword2" class="h-5 w-5"></Eye>
                <EyeOff v-else class="h-5 w-5"></EyeOff>
              </button>
            </div>
          </div>
          <button
            type="submit"
            class="w-full mt-4 bg-zinc-700 text-white py-3 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-lg"
          >
            Sign Up
          </button>
        </Form>
        <Message v-if="error" severity="error" class="mt-4 text-sm">
          {{ error }}
        </Message>
      </template>
      <template #footer>
        <div class="text-center mt-6 text-zinc-600 text-sm">
          Already have an account?
          <a href="/login" class="text-zinc-700 hover:underline font-semibold"
            >Log In</a
          >
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import router from "../router";
import { signup } from "@/utils/api";

const email = ref("");
const firstName = ref("");
const lastName = ref("");
const password1 = ref("");
const password2 = ref("");
const error = ref("");

const showPassword1 = ref(false);
const showPassword2 = ref(false);

function toggleShowPassword1() {
  showPassword1.value = !showPassword1.value;
}

function toggleShowPassword2() {
  showPassword2.value = !showPassword2.value;
}

async function onClickSignup() {
  if (
    !email.value ||
    !password1.value ||
    !email.value ||
    !password2.value ||
    !firstName.value ||
    !lastName.value
  ) {
    error.value = "All fields are required.";
    return;
  }
  if (password1.value != password2.value) {
    error.value = "Passwords must match";
    return;
  }
  try {
    await signup(email.value, firstName.value, lastName.value, password1.value);
    router.push("/login");
  } catch (err) {
    if (err.response.data.errors) {
      error.value = err.response.data.errors[0];
    } else {
      error.value = err.response.data.error;
    }
  }
}
</script>
