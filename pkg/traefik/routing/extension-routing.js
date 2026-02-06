import ListResource from '@shell/pages/c/_cluster/_product/_resource/index.vue';
import CreateResource from '@shell/pages/c/_cluster/_product/_resource/create.vue';
import ViewResource from '@shell/pages/c/_cluster/_product/_resource/_id.vue';
import ViewNamespacedResource from '@shell/pages/c/_cluster/_product/_resource/_namespace/_id.vue';

const PRODUCT = 'traefik';

const routes = [
  {
    name:      `${ PRODUCT }-c-cluster-resource`,
    path:      `/:cluster/${ PRODUCT }/:resource`,
    component: ListResource,
    meta:      {
      product: PRODUCT,
      pkg:     PRODUCT
    },
  },
  {
    name:      `${ PRODUCT }-c-cluster-resource-create`,
    path:      `/:cluster/${ PRODUCT }/:resource/create`,
    component: CreateResource,
    meta:      {
      product: PRODUCT,
      pkg:     PRODUCT
    },
  },
  {
    name:      `${ PRODUCT }-c-cluster-resource-id`,
    path:      `/:cluster/${ PRODUCT }/:resource/:id`,
    component: ViewResource,
    meta:      {
      product: PRODUCT,
      pkg:     PRODUCT
    },
  },
  {
    name:      `${ PRODUCT }-c-cluster-resource-namespace-id`,
    path:      `/:cluster/${ PRODUCT }/:resource/:namespace/:id`,
    component: ViewNamespacedResource,
    meta:      {
      product: PRODUCT,
      pkg:     PRODUCT
    },
  },
];

export default routes;
