<template>
  <div class="flex justify-center items-center">
    <Card class="w-1/2 max-w-lg shadow-2xl">
      <template #title>
        <div class="pb-2 text-xl font-semibold text-center">Profile</div>
      </template>
      <template #content>
        <Button @click="() => logout()">Logout</Button>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getCurrentUserObj } from "@/utils/auth";
import { logout } from "@/utils/auth";

const user = ref({});

onMounted(async () => {
  user.value = await getCurrentUserObj();
});
</script>
