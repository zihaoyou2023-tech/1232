
<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="info-card">
    <h3>{{ title }}</h3>
    <p class="info-text">{{ content }}</p>
  </div>
</template>
