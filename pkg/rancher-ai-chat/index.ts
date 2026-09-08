// Adapted from rancher-ai-ui for this chat-only extension; see README.md and LICENSE.
import { defineAsyncComponent } from 'vue';
import { importTypes } from '@rancher/auto-import';
import { ActionLocation, IPlugin } from '@shell/core/types';
import extensionRouting from './routing/extension-routing';
import connectionStore from './store/connection';
import chatStore from './store/chat';
import inputStore from './store/input';
import contextStore from './store/context';
import stagingStore from './store/staging';
import Chat from './handlers/chat';
import Hooks from './handlers/hooks/index';
import BadgeSlidingOverlay from './handlers/hooks/overlay/badge-sliding';
import BannerButtonOverlay from  './handlers/hooks/overlay/banner-button';

// Init the package
export default function(extension: IPlugin, { store }: any): void {
  // Auto-import model, detail, edit from the folders
  importTypes(extension);

  // Provide extension metadata from package.json
  extension.metadata = require('./package.json');

  // Load a product
  extension.addProduct(require('./product'));

  // Add Vue Routes
  extension.addRoutes(extensionRouting);

  // Register the Chat component
  extension.register('component', 'RancherAIChatComponent', defineAsyncComponent(() => import('./pages/Chat.vue')) as Function);

  // Open chat window action
  extension.addAction(
    ActionLocation.HEADER,
    {},
    {
      labelKey:   'aiChat.action.openChat',
      tooltipKey: 'aiChat.action.openChat',
      shortcut: { 
        windows: ['alt', 'k'], 
        // Meta + Shift + K doesn't work on INPUT/textarea elements
        // So there is a bugfix on Console.vue to close it to avoid the bug
        mac: ['meta', 'shift', 'k'] 
      },
      icon: 'icon-ai',
      invoke: () => {
        Chat.isOpen(store) ? Chat.close(store) : Chat.open(store);
      },
    }
  );

  // Add stores
  extension.addDashboardStore(connectionStore.config.namespace, connectionStore.specifics, connectionStore.config);
  extension.addDashboardStore(chatStore.config.namespace, chatStore.specifics, chatStore.config);
  extension.addDashboardStore(inputStore.config.namespace, inputStore.specifics, inputStore.config);
  extension.addDashboardStore(contextStore.config.namespace, contextStore.specifics, contextStore.config);
  extension.addDashboardStore(stagingStore.config.namespace, stagingStore.specifics, stagingStore.config);

  // Inject hooks in the main window
  Hooks.inject(BadgeSlidingOverlay, store);
  Hooks.inject(BannerButtonOverlay, store);
}
