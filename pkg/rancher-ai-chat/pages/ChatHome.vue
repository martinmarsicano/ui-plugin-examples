<script setup lang="ts">
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from '@shell/composables/useI18n';
import Chat from '../handlers/chat';

const store = useStore();
const { t } = useI18n(store);

function openChat() {
  if (!Chat.isOpen(store)) {
    Chat.open(store);
  }
}

onMounted(openChat);
</script>

<template>
  <main class="ai-chat-home">
    <h1>{{ t('aiChat.header.title') }}</h1>
    <p>{{ t('aiChat.home.description') }}</p>
    <button class="btn role-primary" @click="openChat">
      {{ t('aiChat.action.openChat') }}
    </button>
  </main>
</template>

<style scoped>
.ai-chat-home {
  padding: 24px;
  max-width: 640px;
}
p {
  margin: 16px 0;
}
</style>
