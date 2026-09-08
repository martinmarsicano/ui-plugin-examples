<script setup lang="ts">
import chatIcon from '../../../assets/chat-icon.svg';

</script>
<template>
  <div class="system-msg-avatar">
    <img
      class="img-svg"
      :src="chatIcon"
      alt="AI Chat avatar"
      width="24"
      height="24"
    />
  </div>
</template>

<style lang='scss' scoped>
.system-msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--body-bg);
  border: 1px solid var(--border);
  color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>