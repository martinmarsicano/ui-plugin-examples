import SteveModel from '@rancher/shell/plugins/steve/steve-class';

export default class IngressRoute extends SteveModel {
  get matchText() {
    const routes = this.spec?.routes || [];

    if (routes.length === 0) {
      return '';
    }
    if (routes.length === 1) {
      return routes[0]?.match || '';
    }

    return `${ routes[0]?.match || '' } (+${ routes.length - 1 } more)`;
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

    return `${ destinations[0] } (+${ destinations.length - 1 } more)`;
  }
}
