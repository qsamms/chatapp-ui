<template>
  <div class="flex min-h-screen">
    <NavBar :items="navItems" @navigate="onClickNavigate"></NavBar>
    <div class="flex-1"></div>
  </div>
</template>

<script setup>
import NavBar from "./NavBar.vue";
import { onClickNavigate, navItems } from "../router/index";
</script>
