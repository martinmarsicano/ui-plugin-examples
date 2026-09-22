import SteveModel from '@rancher/shell/plugins/steve/steve-class';

const INGRESS_CLASS_ANNOTATION = 'kubernetes.io/ingress.class';

export default class IngressRouteTCP extends SteveModel {
  get ingressClassText() {
    return this.metadata?.annotations?.[INGRESS_CLASS_ANNOTATION] || '';
  }

  get matchText() {
    const routes = this.spec?.routes || [];

    if (routes.length === 0) {
      return '';
    }
    if (routes.length === 1) {
      return routes[0]?.match || '';
    }

    var routesText = '';
    for (const route of routes) {
      routesText += `${ route?.match || '' } `;
    }
    return `${ routesText.trim() }`;
  }

  get destinationText() {
    const routes = this.spec?.routes || [];
    const destinations = [];

    for (const route of routes) {
      const services = route?.services || [];

      for (const service of services) {
        if (service?.name && service?.port) {
          destinations.push(`${ service.name }:${ service.port }`);
        }
      }
    }

    if (destinations.length === 0) {
      return '';
    }
    if (destinations.length === 1) {
      return destinations[0];
    }

    var destinationsText = '';
    for (const destination of destinations) {
      destinationsText += `${ destination } `;
    }
    return `${ destinationsText.trim() }`;
  }
}
