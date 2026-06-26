<script setup lang="ts">
import type { SlideImage } from '~/composables/useSlideshow'

interface Props {
  step: number
  title: string
}

const props = defineProps<Props>()

const { data: apiData, pending, error, refresh } = await useFetch('/api/images', {
  refreshInterval: 60000, // Refresh every minute
})

const images = computed<SlideImage[]>(() => {
  if (!apiData.value?.images) return []
  return apiData.value.images.map((img: { id: string; name: string; url: string }) => ({
    id: img.id,
    name: img.name,
    url: img.url
  })).filter((img: SlideImage) => img.url)
})

const { currentIndex, currentSlide, currentSlideSet } = useSlideshow(images, props.step)

// Refresh data when folder changes
watch(() => apiData.value, () => {
  // Data updated, slideshow composable will handle the new images
})
</script>

<template>
  <div class="display-container">
    <!-- Loading state -->
    <div v-if="pending" class="loading">
      <div class="spinner"></div>
      <span>Laddar...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error">
      <span>Kunde inte ladda bilder</span>
      <button @click="refresh">Försök igen</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="images.length === 0" class="empty">
      <span>Inga bilder hittades</span>
      <small> Kontrollera att Google Drive-mappen har bilder </small>
    </div>

    <!-- Single image display (portrait) -->
    <template v-else-if="step === 1">
      <Transition name="fade" mode="out-in">
        <div v-if="currentSlide" :key="currentSlide.id" class="portrait-container">
          <img :src="currentSlide.url" :alt="currentSlide.name" class="slide-image single" />
        </div>
      </Transition>
    </template>

    <!-- Double image display (landscape) -->
    <div v-else-if="step === 2" class="grid-container">
      <div class="image-cell left">
        <img :src="currentSlideSet[0]?.url" :alt="currentSlideSet[0]?.name" />
      </div>
      <div class="image-cell right">
        <img :src="currentSlideSet[1]?.url" :alt="currentSlideSet[1]?.name" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.display-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
  position: relative;
}

.loading,
.error,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error button {
  padding: 0.5rem 1rem;
  background: #fff;
  border: none;
  color: #000;
  cursor: pointer;
  border-radius: 4px;
}

.empty small {
  color: #888;
  font-size: 0.875rem;
}

/* Portrait image layout - fills screen when rotated */
.portrait-container {
  width: 100vw;
  height: 100vh;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-image.single {
  /* After -90° rotation: original height becomes visual width */
  max-width: 100vh;
  max-height: 100vw;
  transform: rotate(-90deg);
}

/* Double image layout (landscape) */
.grid-container {
  width: 100vw;
  height: 100vh;
  display: flex;
}

.image-cell {
  width: 50%;
  height: 100vh;
  display: flex;
  align-items: center;
}

.image-cell.left {
  justify-content: flex-end;
}

.image-cell.right {
  justify-content: flex-start;
}

.image-cell img {
  max-width: 100%;
  max-height: 100vh;
  object-fit: contain;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
