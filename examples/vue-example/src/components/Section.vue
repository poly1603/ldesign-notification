<template>
  <div class="section">
    <h2 class="section-title">{{ title }}</h2>
    <p v-if="description" class="section-description">{{ description }}</p>
    <div class="section-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.section {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #e0e0e0;
}

.section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 24px;
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
}

.section-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.section-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>

