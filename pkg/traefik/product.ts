import { STATE, NAME as NAME_COL, AGE, NAMESPACE } from '@shell/config/table-headers';

export function init($plugin: any, store: any) {
  const PRODUCT_NAME = 'explorer';
  const INGRESS_ROUTE = 'traefik.io.ingressroute';
  const INGRESS_ROUTE_TCP = 'traefik.io.ingressroutetcp';

  const {
    configureType,
    basicType,
    headers
  } = $plugin.DSL(store, PRODUCT_NAME);

  configureType(INGRESS_ROUTE, {
    displayName: 'IngressRoute',
    isCreatable: true,
    isEditable:  true,
    isRemovable: true,
    showAge:     true,
    showState:   true,
    canYaml:     true,
  });

  configureType(INGRESS_ROUTE_TCP, {
    displayName: 'IngressRouteTCP',
    isCreatable: true,
    isEditable:  true,
    isRemovable: true,
    showAge:     true,
    showState:   true,
    canYaml:     true,
  });

  headers(INGRESS_ROUTE, [
    STATE,
    NAME_COL,
    NAMESPACE,
    {
      name:     'match',
      label:    'Match',
      getValue: (row: any) => row.matchText,
      search:   ['spec.routes'],
    },
    {
      name:     'destination',
      label:    'Destination',
      getValue: (row: any) => row.destinationText,
    },
    AGE,
  ]);

  headers(INGRESS_ROUTE_TCP, [
    STATE,
    NAME_COL,
    NAMESPACE,
    {
      name:     'match',
      label:    'Match',
      getValue: (row: any) => row.matchText,
    },
    {
      name:     'destination',
      label:    'Destination',
      getValue: (row: any) => row.destinationText,
    },
    AGE,
  ]);

  basicType([INGRESS_ROUTE, INGRESS_ROUTE_TCP], 'serviceDiscovery');
}
