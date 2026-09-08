<!-- Adapted from rancher-ai-ui for this chat-only extension; see README.md and LICENSE. -->
<script setup lang="ts">
import { useStore } from 'vuex';
import { useI18n } from '@shell/composables/useI18n';
import { useToolsComposable } from '../../composables/useToolsComposable';

const store = useStore();
const { t } = useI18n(store);

const { toolsStatus } = useToolsComposable();
</script>

<template>
  <Transition name="fade-dissolve">
    <div
      v-if="toolsStatus && toolsStatus !== 'available'"
      class="chat-required-tools-action-msg-bubble"
      data-testid="rancher-ai-chat-required-tools-action-message"
    >
      <div class="chat-required-tools-action-msg-text">
        {{ t(`aiChat.message.system.tools.${ toolsStatus }`) }}
      </div>
    </div>
  </Transition>
</template>

<style lang='scss' scoped>
.chat-required-tools-action-msg-bubble {
  position: relative;
  background: var(--body-bg);
  color: var(--body-text);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 var(--shadow);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  line-height: 21px;
}

.chat-required-tools-action-msg-text, :deep() pre {
  word-break: break-word;
  white-space: pre-line;
  list-style-position: inside;
}

.fade-dissolve-enter-active,
.fade-dissolve-leave-active {
  transition: opacity 0.3s ease;
}

.fade-dissolve-enter-from,
.fade-dissolve-leave-to {
  opacity: 0;
}
</style>
