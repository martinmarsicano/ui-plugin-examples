import {
  ref, nextTick, watch, onMounted, onBeforeUnmount, type Ref,
} from 'vue';

/**
 * Composable for handling the Messages panel scroll.
 *
 * @param containerRef - Ref to the scrollable container element
 * @param layout - Optional function that returns the current layout, used to trigger scroll restoration on layout changes
 *
 * @returns Object with scroll-related state and utilities
 */
export function useScrollComposable(containerRef: Ref<HTMLDivElement | null>, layout?: () => string) {
  const lastScrollPosition = ref<number>(0);
  const autoScrollEnabled = ref(true);
  const fastScrollEnabled = ref(false);

  /**
   * Update scroll state flags based on container scroll position
   * This can't be throttled/debounced as it would generate flickering on ScrollButton click
   */
  function updateScrollState() {
    const container = containerRef.value;

    if (!container) {
      return;
    }

    autoScrollEnabled.value = container.scrollTop + container.clientHeight >= container.scrollHeight - 2;
    fastScrollEnabled.value = container.scrollTop + container.clientHeight < container.scrollHeight - 150;

    // Save scroll position on every scroll event
    lastScrollPosition.value = container.scrollTop;
  }

  /**
   * Scroll to bottom of container
   */
  function scrollToBottom(args?: { force: boolean }) {
    if (!containerRef.value) {
      return;
    }

    if (!args?.force && !autoScrollEnabled.value) {
      return;
    }

    // Remove scroll listener to prevent interference with scroll state updates during programmatic scroll
    containerRef.value.removeEventListener('scroll', updateScrollState);

    containerRef.value.scrollTop = containerRef.value.scrollHeight;

    requestAnimationFrame(() => {
      if (containerRef.value) {
        // Re-add listener after scroll event fires
        containerRef.value.addEventListener('scroll', updateScrollState);

        // Manually set scroll state after programmatic scroll to ensure state is consistent
        autoScrollEnabled.value = true;
        fastScrollEnabled.value = false;
      }
    });
  }

  /**
   * Watch layout changes to restore scroll position
   */
  if (layout) {
    watch(
      layout,
      () => {
        // Restore scroll immediately on layout change
        nextTick(() => {
          if (containerRef.value) {
            containerRef.value.scrollTop = lastScrollPosition.value;
          }
        });
      }
    );
  }

  /**
   * Setup scroll event listener on mount
   */
  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', updateScrollState);
    }
  });

  /**
   * Cleanup scroll event listener on unmount
   */
  onBeforeUnmount(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', updateScrollState);
    }
  });

  return {
    lastScrollPosition,
    fastScrollEnabled,
    updateScrollState,
    scrollToBottom,
  };
}
