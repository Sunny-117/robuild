<template>
  <button 
    :class="['btn', `btn-${variant}`]" 
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false
})

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: #007acc;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
