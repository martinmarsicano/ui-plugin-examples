<!-- components/DeploymentIngressRoutesTab.vue -->
<script>
import ResourceTable from '@shell/components/ResourceTable';
import { STATE, NAME as NAME_COL, AGE } from '@shell/config/table-headers';

export default {
  components: { ResourceTable },

  props: {
    resource: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const [ingressRoutes, services] = await Promise.all([
      this.$store.dispatch('cluster/findAll', { type: 'traefik.io.ingressroute' }),
      this.$store.dispatch('cluster/findAll', { type: 'service' }),
    ]);

    this.allIngressRoutes = ingressRoutes;
    this.allServices = services;
  },

  data() {
    return {
      allIngressRoutes: [],
      allServices:      [],
    };
  },

  computed: {
    /**
     * Names of Services in the same namespace whose selector matches
     * this Deployment's pod template labels.
     */
    matchingServiceNames() {
      const ns = this.resource?.metadata?.namespace;
      const podLabels = this.resource?.spec?.template?.metadata?.labels || {};

      if (!ns || Object.keys(podLabels).length === 0) {
        return new Set();
      }

      return new Set(
        this.allServices
          .filter((svc) => {
            if (svc.metadata?.namespace !== ns) {
              return false;
            }
            const selector = svc.spec?.selector;

            if (!selector || Object.keys(selector).length === 0) {
              return false;
            }

            // Service targets the deployment if every selector entry
            // is present in the deployment's pod template labels.
            return Object.entries(selector).every(
              ([k, v]) => podLabels[k] === v
            );
          })
          .map((svc) => svc.metadata.name)
      );
    },

    relatedIngressRoutes() {
      const ns = this.resource?.metadata?.namespace;
      const serviceNames = this.matchingServiceNames;

      if (!ns || serviceNames.size === 0) {
        return [];
      }

      return this.allIngressRoutes
        .filter((ir) => ir.metadata?.namespace === ns)
        .filter((ir) => {
          const routes = ir.spec?.routes || [];

          return routes.some((route) =>
            (route.services || []).some((svc) => serviceNames.has(svc.name))
          );
        })
        .map((ir) => {
          const routes = ir.spec?.routes || [];
          const matchText = routes
            .map((r) => r.match)
            .filter(Boolean)
            .join(', ');
          const destinationText = routes
            .flatMap((r) => (r.services || []).map((s) => {
              const port = s.port ? `:${ s.port }` : '';
              return `${ s.name }${ port }`;
            }))
            .join(', ');

          // Return a proxy that preserves the original resource methods
          // (so row actions still work) while exposing computed columns.
          return new Proxy(ir, {
            get(target, prop) {
              if (prop === 'matchText') {
                return matchText;
              }
              if (prop === 'destinationText') {
                return destinationText;
              }
              return target[prop];
            },
          });
        });
    },

    headers() {
      return [
        STATE,
        NAME_COL,
        {
          name:     'match',
          label:    'Match',
          value:    'matchText',
        },
        {
          name:     'destination',
          label:    'Destination',
          value:    'destinationText',
        },
        AGE,
      ];
    },
  },
};
</script>

<template>
  <div>
    <ResourceTable
      :rows="relatedIngressRoutes"
      :headers="headers"
      :search="true"
      :row-actions="true"
      key-field="id"
      :table-actions="false"
    />
    <div v-if="!$fetchState.pending && relatedIngressRoutes.length === 0" class="text-center p-20 text-muted">
      No IngressRoutes found targeting this Deployment.
    </div>
  </div>
</template>
