<template>
  <div class="flex justify-center items-center">
    <Card class="w-1/2 max-w-lg shadow-2xl">
      <template #title>
        <div class="pb-2 text-xl font-semibold text-center">Signup</div>
      </template>
      <template #content>
        <Form @submit="onClickSignup" class="flex flex-col gap-4">
          <div class="flex flex-col">
            <label class="text-left">Email</label>
            <InputText v-model="email" required />
          </div>
          <div class="flex flex-col">
            <label class="text-left">Username</label>
            <InputText v-model="username" required />
          </div>
          <div class="flex flex-col">
            <label for="Username" class="text-left">Password</label>
            <Password
              v-model="password1"
              toggleMask
              :feedback="false"
              fluid
              required
            />
          </div>
          <div class="flex flex-col">
            <label for="Username" class="text-left">Confirm Password</label>
            <Password
              v-model="password2"
              toggleMask
              :feedback="false"
              fluid
              required
            />
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
import router from "../router";
import { signup } from "@/utils/api";

const email = ref("");
const username = ref("");
const password1 = ref("");
const password2 = ref("");
const error = ref("");

async function onClickSignup() {
  if (!username.value || !password1.value || !email.value || !password2.value) {
    error.value = "All fields are required.";
    return;
  }
  if (password1.value != password2.value) {
    error.value = "Passwords must match";
    return;
  }
  try {
    await signup(email.value, username.value, password1.value);
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
