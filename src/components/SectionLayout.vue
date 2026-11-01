
<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  sectionId: {
    type: String,
    default: ''
  },
  extraClass: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <section
    :id="sectionId"
    :class="['section', extraClass]"
  >
    <h2>{{ title }}</h2>

    <p
      v-if="content"
      class="section-description"
    >
      {{ content }}
    </p>

    <slot></slot>
  </section>
</template>
