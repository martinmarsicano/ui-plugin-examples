import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';
import extensionRouting from './routing/extension-routing';
import { TabLocation } from '@shell/core/types';

// Init the package
export default function(plugin: IPlugin) {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide extension metadata from package.json
  // it will grab information such as `name` and `description`
  plugin.metadata = require('./package.json');

  // Load a product
  plugin.addProduct(require('./product'));

  // Add Vue Routes
  plugin.addRoutes(extensionRouting);

  plugin.addTab(
    TabLocation.RESOURCE_DETAIL,
    { resource: ['apps.deployment', 'apps.statefulset'] },
    {
      name:      'ingress-routes',
      labelKey:  'traefik.ingressRoutes',
      label:     'IngressRoutes',
      component: () => import('./components/DeploymentIngressRoutesTab.vue'),
      weight:    1,
    }
  );
  plugin.addTab(
    TabLocation.RESOURCE_DETAIL,
    { resource: ['apps.deployment', 'apps.statefulset'] },
    {
      name:      'ingress-routes-tcp',
      labelKey:  'traefik.ingressRoutesTCP',
      label:     'IngressRoutesTCP',
      component: () => import('./components/DeploymentIngressRoutesTCPTab.vue'),
      weight:    1,
    }
  );
}
