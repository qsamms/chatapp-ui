<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center"
  >
    <!-- Background overlay -->
    <div
      class="fixed inset-0 bg-black bg-opacity-50"
      @click="dismissableMask ? close() : null"
    ></div>

    <!-- Dialog panel -->
    <div
      class="relative z-10 bg-white border-2 border-zinc-950 rounded-lg p-6 min-w-[400px] md:min-w-[500px] min-h-[250px]"
      @click.stop
    >
      <!-- Close button -->
      <button
        v-if="closeOnEscape"
        class="absolute top-2 right-2 text-gray-500 hover:text-black"
        @click="close"
      >
        ✕
      </button>

      <!-- Header slot -->
      <div class="mb-4">
        <slot name="header" />
      </div>

      <!-- Body slot -->
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  dismissableMask: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
});

const emit = defineEmits(["update:visible"]);

function close() {
  emit("update:visible", false);
}

// Close on ESC key
onMounted(() => {
  if (props.closeOnEscape) {
    window.addEventListener("keydown", onEsc);
  }
});

onBeforeUnmount(() => {
  if (props.closeOnEscape) {
    window.removeEventListener("keydown", onEsc);
  }
});

function onEsc(e) {
  if (e.key === "Escape") close();
}
</script>

<style scoped>
/* You can style transitions or dark mode here if needed */
</style>
