<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        @keydown.esc="closeOnEscape && close()"
        tabindex="0"
      >
        <div class="absolute inset-0" @click="dismissableMask && close()"></div>

        <transition name="scale-fade">
          <div
            class="relative z-10 bg-white rounded-xl shadow-xl p-6 max-w-lg w-full"
            :class="customClass"
            @click.stop
          >
            <div v-if="$slots.header" class="flex justify-between mb-4">
              <slot name="header" />
              <X
                @click="close()"
                class="hover:bg-zinc-200 rounded-lg hover:cursor-pointer"
              ></X>
            </div>

            <slot />

            <div v-if="$slots.footer" class="mt-4">
              <slot name="footer" />
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { watch, ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  modelValue: Boolean,
  dismissableMask: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
  customClass: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);

const visible = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
  }
);

function close() {
  visible.value = false;
  emit("update:modelValue", false);
}

onMounted(() => {
  if (visible.value) document.body.classList.add("overflow-hidden");
});
onUnmounted(() => {
  document.body.classList.remove("overflow-hidden");
});
watch(visible, (val) => {
  if (val) document.body.classList.add("overflow-hidden");
  else document.body.classList.remove("overflow-hidden");
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.2s ease;
}
.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
