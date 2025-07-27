<template>
  <video
    ref="videoEl"
    controls
    width="350"
    class="max-w-full h-auto rounded-lg shadow-md"
  ></video>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import * as dashjs from "dashjs";

const props = defineProps({
  src: String,
});

const videoEl = ref(null);
let player;

onMounted(() => {
  if (videoEl.value && props.src) {
    player = dashjs.MediaPlayer().create();
    player.initialize(videoEl.value, props.src, false);
  }
});

onBeforeUnmount(() => {
  if (player) {
    player.reset();
  }
});
</script>
