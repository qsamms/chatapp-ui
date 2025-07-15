<template>
  <aside
    :class="[
      'h-screen border-r border-gray-200 flex flex-col transition-all duration-300',
      collapsed ? 'w-10' : 'w-60',
    ]"
  >
    <!-- Toggle Button -->
    <div class="p-2 flex justify-end">
      <button
        @click="collapsed = !collapsed"
        class="text-gray-500 hover:text-black"
      >
        <span v-if="collapsed"><ArrowRight /></span>
        <span v-else><ArrowLeft /></span>
      </button>
    </div>

    <!-- Navigation Items -->
    <nav v-if="!collapsed" class="flex-1 overflow-y-auto">
      <ul class="space-y-3 p-4">
        <li
          v-for="item in items"
          :key="item.name"
          @click="handleClick(item)"
          :class="[
            'cursor-pointer flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-200',
            'bg-gray-800 font-semibold',
          ]"
        >
          <component
            :is="item.icon"
            class="w-5 h-5 text-gray-600 shrink-0"
            v-if="item.icon"
          />
          <span
            class="transition-opacity duration-300 text-center"
            :class="
              collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
            "
          >
            {{ item.label }}
          </span>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["navigate"]);

const collapsed = ref(false);

function handleClick(item) {
  console.log(item);
  emit("navigate", item.name);
}
</script>
