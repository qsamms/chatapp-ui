<template>
  <div>
    <video
      ref="videoEl"
      controls
      width="300"
      class="max-w-full h-auto rounded"
    ></video>
  </div>
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

    player.updateSettings({
      streaming: {
        retryIntervals: {
          MPD: 5000,
          XLinkExpansion: 5000,
          InitializationSegment: 5000,
          IndexSegment: 5000,
          MediaSegment: 5000,
          BitstreamSwitchingSegment: 5000,
          FragmentInfoSegment: 5000,
          TextSegment: 5000,
        },
        retryAttempts: {
          MPD: 5,
          XLinkExpansion: 5,
          InitializationSegment: 5,
          IndexSegment: 5,
          MediaSegment: 5,
          BitstreamSwitchingSegment: 5,
          FragmentInfoSegment: 5,
          TextSegment: 5,
        },
      },
    });

    player.initialize(videoEl.value, props.src, false);
  }
});

onBeforeUnmount(() => {
  if (player) {
    player.reset();
  }
});
</script>
