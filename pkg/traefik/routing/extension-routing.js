import ListResource from '@shell/pages/c/_cluster/_product/_resource/index.vue';
import CreateResource from '@shell/pages/c/_cluster/_product/_resource/create.vue';
import ViewResource from '@shell/pages/c/_cluster/_product/_resource/_id.vue';
import ViewNamespacedResource from '@shell/pages/c/_cluster/_product/_resource/_namespace/_id.vue';

const PRODUCT = 'traefik';

const routes = [
  {
    name:      `c-cluster-${ PRODUCT }-resource`,
    path:      `/c/:cluster/${ PRODUCT }/:resource`,
    component: ListResource,
    meta:      {
      product: PRODUCT,
      pkg:     PRODUCT
    },
  },
  {
    name:      `c-cluster-${ PRODUCT }-resource-create`,
    path:      `/c/:cluster/${ PRODUCT }/:resource/create`,
    component: CreateResource,
    meta:      {
      product: PRODUCT,
      pkg:     PRODUCT
    },
  },
  {
    name:      `c-cluster-${ PRODUCT }-resource-id`,
    path:      `/c/:cluster/${ PRODUCT }/:resource/:id`,
    component: ViewResource,
    meta:      {
      product: PRODUCT,
      pkg:     PRODUCT
    },
  },
  {
    name:      `c-cluster-${ PRODUCT }-resource-namespace-id`,
    path:      `/c/:cluster/${ PRODUCT }/:resource/:namespace/:id`,
    component: ViewNamespacedResource,
    meta:      {
      product: PRODUCT,
      pkg:     PRODUCT
    },
  },
];

export default routes;
