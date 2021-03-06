import {module} from 'angular';

import {STATE_CONFIG_PROVIDER, StateConfigProvider} from 'core/navigation/state.provider';
import {IStateParamsService} from 'angular-ui-router';

export interface IInfrastructureStateParams extends IStateParamsService {
  q: string;
}

export const INFRASTRUCTURE_STATES = 'spinnaker.core.search.states';
module(INFRASTRUCTURE_STATES, [
  STATE_CONFIG_PROVIDER
]).config((stateConfigProvider: StateConfigProvider) => {
  stateConfigProvider.addToRootState({
    name: 'infrastructure',
    url: '/infrastructure?q',
    reloadOnSearch: false,
    views: {
      'main@': {
        templateUrl: require('./infrastructure.html'),
        controller: 'InfrastructureCtrl',
        controllerAs: 'ctrl'
      }
    },
    data: {
      pageTitleMain: {
        label: 'Infrastructure'
      }
    }
  });
  stateConfigProvider.addRewriteRule('/', '/infrastructure');
});
