export interface SlideImage {
	id: string;
	name: string;
	url: string;
}

export function useSlideshow(images: Ref<SlideImage[]>, step: number = 1) {
	const config = useRuntimeConfig();
	const currentIndex = ref(0);
	const interval = ref<ReturnType<typeof setInterval> | null>(null);

	const currentSlide = computed(() => {
		if (images.value.length === 0) return null;
		return images.value[currentIndex.value % images.value.length];
	});

	const currentSlideSet = computed(() => {
		if (images.value.length === 0) return [];
		const slideSet: SlideImage[] = [];
		for (let i = 0; i < step; i++) {
			const idx = (currentIndex.value + i) % images.value.length;
			slideSet.push(images.value[idx]);
		}
		return slideSet;
	});

	function nextSlide() {
		if (images.value.length === 0) return;
		currentIndex.value = (currentIndex.value + step) % images.value.length;
	}

	function startSlideshow() {
		if (interval.value) clearInterval(interval.value);

		interval.value = setInterval(() => {
			nextSlide();
		}, config.public.slideInterval);
	}

	function stopSlideshow() {
		if (interval.value) {
			clearInterval(interval.value);
			interval.value = null;
		}
	}

	// Auto-start on mount
	onMounted(() => {
		startSlideshow();
	});

	// Cleanup on unmount
	onUnmounted(() => {
		stopSlideshow();
	});

	return {
		currentIndex: readonly(currentIndex),
		currentSlide,
		currentSlideSet,
		nextSlide,
		startSlideshow,
		stopSlideshow,
	};
}
