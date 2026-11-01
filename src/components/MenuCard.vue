
<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['add-to-cart'])
</script>

<template>
  <div class="menu-card">
    <img
      v-if="image"
      :src="image"
      :alt="title"
      loading="lazy"
    >

    <div class="menu-content">
      <h3>{{ title }}</h3>
      <p>{{ content }}</p>

      <span class="price">
        NT$ {{ price.toLocaleString('zh-TW') }}
      </span>

      <button
        type="button"
        class="btn add-to-cart"
        @click="emit('add-to-cart', {
          name: title,
          price: price
        })"
      >
        加入購物車
      </button>
    </div>
  </div>
</template>
