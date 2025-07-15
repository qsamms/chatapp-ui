<template>
  <div class="flex">
    <NavBar :items="navItems" @navigate="onClickNavigate"></NavBar>
    <div class="flex-1 justify-center items-center mt-8">
      <Button @click="() => logout()">Logout</Button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getCurrentUserObj } from "@/utils/auth";
import { logout } from "@/utils/auth";
import { onClickNavigate, navItems } from "../router/index";

const user = ref({});

onMounted(async () => {
  user.value = await getCurrentUserObj();
});
</script>
