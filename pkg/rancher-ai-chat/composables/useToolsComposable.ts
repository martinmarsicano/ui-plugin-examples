// Adapted from rancher-ai-ui for this chat-only extension; see README.md and LICENSE.
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { CONFIG_MAP } from '@shell/config/types';
import { AGENT_NAMESPACE, TOOLS_CONFIG_NAME } from '../product';
import { warn } from '../utils/log';
import { getRancherVersion } from '../utils/version';
import { selectAvailableTools } from '../utils/toolSelection';
import toolsConfigData from '../ui-tools.json';

/** Read the existing administrator-managed UI tools without changing their configuration. */
export function useToolsComposable() {
  const store = useStore();
  const loaded = ref(false);
  const loadFailed = ref(false);
  const toolsConfigMap = computed(() => store.getters['management/byId'](CONFIG_MAP, `${ AGENT_NAMESPACE }/${ TOOLS_CONFIG_NAME }`));
  const selection = computed(() => selectAvailableTools(
    loadFailed.value ? undefined : toolsConfigMap.value?.data?.config,
    toolsConfigData.tools,
    getRancherVersion(),
    TOOLS_CONFIG_NAME
  ));

  const toolsSelector = computed(() => loaded.value ? selection.value.selector : undefined);
  const toolsStatus = computed(() => loaded.value ? selection.value.status : undefined);

  onMounted(async() => {
    try {
      await store.dispatch('management/find', {
        type: CONFIG_MAP,
        id:   `${ AGENT_NAMESPACE }/${ TOOLS_CONFIG_NAME }`
      });
    } catch (err) {
      loadFailed.value = true;
      warn('UI tools configuration is unavailable; chat can continue without UI tools:', { err });
    } finally {
      loaded.value = true;
    }
  });

  return { toolsSelector, toolsStatus };
}
