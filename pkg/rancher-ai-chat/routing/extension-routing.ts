// Adapted from rancher-ai-ui for this chat-only extension; see README.md and LICENSE.
import { PRODUCT_NAME } from '../product';
import ChatHome from '../pages/ChatHome.vue';
import Staging from '../pages/staging/index.vue';

export default [
  {
    path: `/c/:cluster/${ PRODUCT_NAME }/chat`,
    name: `${ PRODUCT_NAME }-c-cluster-chat`,
    component: ChatHome,
    meta: { product: PRODUCT_NAME, pkg: PRODUCT_NAME },
  },
  {
    path: `/c/:cluster/${ PRODUCT_NAME }/staging`,
    name: `c-cluster-${ PRODUCT_NAME }-staging`,
    component: Staging,
    meta: { product: PRODUCT_NAME, pkg: PRODUCT_NAME },
  },
];
