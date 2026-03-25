<!-- components/DeploymentIngressRoutesTab.vue -->
<script>
import ResourceTable from '@shell/components/ResourceTable';
import { STATE, NAME as NAME_COL, AGE, NAMESPACE } from '@shell/config/table-headers';
import { WORKLOAD_TYPES } from '@shell/config/types';

export default {
  components: { ResourceTable },

  props: {
    resource: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const ingressRoutes = await this.$store.dispatch('cluster/findAll', {
      type: 'traefik.io.ingressroute',
    });

    this.allIngressRoutes = ingressRoutes;
  },

  data() {
    return {
      allIngressRoutes: [],
    };
  },

  computed: {
    /**
     * Match IngressRoutes whose backend services reference
     * the same service(s) that this Deployment's selector targets.
     */
    relatedIngressRoutes() {
      const deploymentName = this.resource?.metadata?.name;
      const deploymentNamespace = this.resource?.metadata?.namespace;

      if (!deploymentName || !deploymentNamespace) {
        return [];
      }

      return this.allIngressRoutes.filter((ir) => {
        if (ir.metadata?.namespace !== deploymentNamespace) {
          return false;
        }

        const routes = ir.spec?.routes || [];

        return routes.some((route) => {
          const services = route.services || [];

          // Match if any backend service name matches the deployment name
          // (common convention: service name == deployment name)
          return services.some((svc) => svc.name === deploymentName);
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
          getValue: (row) => row.matchText,
        },
        {
          name:     'destination',
          label:    'Destination',
          getValue: (row) => row.destinationText,
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
