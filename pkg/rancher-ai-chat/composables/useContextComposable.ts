// Adapted from rancher-ai-ui for this chat-only extension; see README.md and LICENSE.
import { ref, computed, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import type { Context } from '../types';

/**
 * Composable for managing the AI context state.
 * @returns Composable for managing the AI context state.
 */
export function useContextComposable() {
  const store = useStore();

  const context = computed(() => store.getters['rancher-ai-chat/context/all']);

  const selectedContext = ref<Context[]>([]);

  function selectContext(context: Context[]) {
    selectedContext.value = context;
  }

  onBeforeUnmount(() => {
    store.commit('rancher-ai-chat/context/reset');
  });

  return {
    context,
    selectContext,
    selectedContext
  };
}
