'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.executionDetails.controller', [
  require('angular-ui-router'),
  require('../../pipeline/config/pipelineConfigProvider.js')
])
  .controller('executionDetails', function($scope, $stateParams, $state, pipelineConfig) {
    var controller = this;

    controller.standalone = controller.standalone || false;

    // This is pretty dirty but executionDetails has its dirty tentacles
    // all over the place. This makes the conversion of the execution directive
    // to a component safe until we tackle converting all the controllers
    // TODO: Convert all the execution details controllers to ES6 controllers and remove references to $scope
    $scope.standalone = controller.standalone;
    $scope.application = controller.application;
    $scope.execution = controller.execution;

    function getStageParams(stageId) {
      const summaries = (controller.execution.stageSummaries || []);
      const stageIndex = summaries.findIndex(s => (s.stages || []).some(s2 => s2.id === stageId));
      if (stageIndex !== -1) {
        const stepIndex = (summaries[stageIndex].stages || []).findIndex(s => s.id === stageId);
        if (stepIndex !== -1) {
          return {
            stage: stageIndex,
            step: stepIndex,
            stageId: null,
          };
        }
      }
      return null;
    }

    function getCurrentStage() {
      if ($stateParams.stageId) {
        const params = getStageParams($stateParams.stageId);
        if (params) {
          $state.go('.', params, {replace: true});
          return params.stage;
        }
      }
      if ($stateParams.refId) {
        let stages = controller.execution.stageSummaries || [];
        let currentStageIndex = _.findIndex(stages, { refId: $stateParams.refId });
        if (currentStageIndex !== -1) {
          $state.go('.', {
            refId: null,
            stage: currentStageIndex,
          });
          return parseInt(currentStageIndex);
        } else {
          $state.go('.', {
            refId: null,
          });
        }
      }
      return parseInt($stateParams.stage);
    }

    function getCurrentStep() {
      return parseInt($stateParams.step);
    }

    controller.close = function() {
      $state.go('^');
    };

    controller.toggleDetails = function(index) {
      var newStepDetails = getCurrentStep() === index ? null : index;
      if (newStepDetails !== null) {
        $state.go('.', {
          stage: getCurrentStage(),
          step: newStepDetails,
        });
      }
    };

    controller.isStageCurrent = function(index) {
      return index === getCurrentStage();
    };

    controller.isStepCurrent = function(index) {
      return index === getCurrentStep();
    };

    controller.closeDetails = function() {
      $state.go('.', { step: null });
    };

    controller.getDetailsSourceUrl = function() {
      if ($stateParams.step !== undefined) {
        let stages = controller.execution.stageSummaries || [];
        var stageSummary = stages[getCurrentStage()];
        if (stageSummary) {
          var step = stageSummary.stages[getCurrentStep()] || stageSummary.masterStage;
          $scope.stageSummary = stageSummary;
          $scope.stage = step;
          var stageConfig = pipelineConfig.getStageConfig(step);
          if (stageConfig && stageConfig.executionDetailsUrl) {
            return stageConfig.executionDetailsUrl;
          }
          return require('./defaultExecutionDetails.html');
        }
      }
      return null;
    };

    controller.getSummarySourceUrl = function() {
      if ($stateParams.stage !== undefined) {
        let currentStage = getCurrentStage();
        let stages = controller.execution.stageSummaries || [];
        let stageSummary = stages.length > currentStage ?
          stages[currentStage] :
          null;
        if (stageSummary) {
          $scope.stageSummary = stageSummary;
          $scope.stage = stageSummary.stages[0];
          var stageConfig = pipelineConfig.getStageConfig(stageSummary);
          if (stageConfig && stageConfig.executionSummaryUrl) {
            return stageConfig.executionSummaryUrl;
          }
        }
      }
      return require('../../pipeline/config/stages/core/executionSummary.html');

    };

    controller.getStepLabel = function(stage) {
      var stageConfig = pipelineConfig.getStageConfig(stage);
      if (stageConfig && stageConfig.executionStepLabelUrl) {
        return stageConfig.executionStepLabelUrl;
      } else {
        return require('../../pipeline/config/stages/core/stepLabel.html');
      }
    };

    controller.isRestartable = function(stage) {
      var stageConfig = pipelineConfig.getStageConfig(stage);
      if (!stageConfig || stage.isRestarting === true) {
        return false;
      }

      const allowRestart = controller.application.attributes.enableRestartRunningExecutions || false;
      if (controller.execution.isRunning && !allowRestart) {
        return false;
      }

      return stageConfig.restartable || false;
    };

  });
