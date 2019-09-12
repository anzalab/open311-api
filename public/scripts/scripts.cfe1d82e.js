'use strict';

/**
 * simple echarts directive
 * Merge of concepts from https://github.com/liekkas/ng-echarts &
 * https://github.com/wangshijun/angular-echarts
 * @author lykmapipo <https://github.com/lykmapipo>
 * //TODO support $http
 * //TODO add basic charts shortcuts
 * //TODO add basic charts directives
 * //TODO add listen to window resize
 */
angular.module('angular-echarts', []).directive('echart', function($window) {
  return {
    restrict: 'EA',
    template:
      '<div config="config" options="options" style="width: 100%; min-height: 400px"></div>',
    scope: {
      options: '=options',
      config: '=config',
      chartObj: '=?chartObj',
    },
    link: function link(scope, element, attrs /*, ctrl*/) {
      //globals
      var chartDOM = element.find('div')[0];
      var parent = element.parent()[0];
      var parentHeight = parent.clientHeight;
      var height = parseInt(attrs.height) || parentHeight || 400;

      //ensure config
      var config = scope.config || {};

      //reference chart
      var chart;

      /**
       * Update or create a echart based on scope config
       * and options
       */
      function refreshChart() {
        var theme =
          scope.config && scope.config.theme ? scope.config.theme : 'shine';

        //compute chart width & height
        height = config.height || height;

        //ensure width & height
        config = angular.extend(
          {
            height: height,
          },
          scope.config
        );

        //ensure chart dom height & width
        chartDOM.style.width = '100%';
        chartDOM.style.minHeight = config.height + 'px';

        if (!chart) {
          chart = echarts.init(chartDOM, theme);
        }

        //TODO handle remote data loading
        //using url and promise

        //force clear chart if so
        if (config.forceClear) {
          chart.clear();
        }

        if (config && scope.options) {
          chart.setOption(scope.options);
          chart.resize();
          chart.hideLoading();
        }

        if (config && config.event) {
          //normalize event config
          if (!Array.isArray(config.event)) {
            config.event = [config.event];
          }

          //bind chart events
          if (angular.isArray(config.event)) {
            angular.forEach(config.event, function(value /*, key*/) {
              for (var e in value) {
                chart.on(e, value[e]);
              }
            });
          }
        }
      }

      //watch config and update chart
      //see https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch
      //see https://www.sitepoint.com/mastering-watch-angularjs/
      var unwatchConfig = scope.$watch(
        function() {
          //expression
          return scope.config;
        },
        function(value) {
          //listener
          if (value) {
            refreshChart();
          }
        },
        true // perfom deep comparison
      );

      //watch options and update chart
      //see https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch
      //see https://www.sitepoint.com/mastering-watch-angularjs/
      var unwatchOptions = scope.$watch(
        function() {
          //expression
          return scope.options;
        },
        function(value) {
          //listener
          if (value) {
            refreshChart();
          }
        },
        true // perfom deep comparison
      );

      //de-register listeners on scope destroy
      scope.$on('$destroy', function deregister() {
        //de-register config watch
        if (unwatchConfig) {
          unwatchConfig();
        }

        //de-register options watch
        if (unwatchOptions) {
          unwatchOptions();
        }
      });

      //listen to window resize and resize charts accordingly
      var _window = angular.element($window);
      if (_window) {
        _window.bind('resize', function() {
          refreshChart();
        });
      }
    },
  };
});

'use strict';

/**
 * @ngdoc overview
 * @name ng311
 * @description open311-web module
 * @version 0.1.0
 * @since  0.1.0
 */
angular
  .module('ng311', [
    'ngSanitize',
    'ngResource',
    'ui.router',
    'ngAA',
    'angular-loading-bar',
    'ui.bootstrap',
    'ngNotify',
    'ngToast',
    'cgPrompt',
    'checklist-model',
    'ngCsv',
    'monospaced.elastic',
    'oi.select',
    'uz.mailto',
    'color.picker',
    'AngularPrint',
    'angular-echarts',
    'btford.socket-io',
    'focus-if',
    'pickadate',
    'ui-leaflet',
    'ngNumeraljs',
    'ngFileUpload',
    'prettyBytes',
  ])
  .config(function(
    $stateProvider,
    $urlRouterProvider,
    $authProvider,
    cfpLoadingBarProvider,
    $numeraljsConfigProvider,
    ENV
  ) {
    //configure ngAA
    //see https://github.com/lykmapipo/ngAA
    $authProvider.afterSigninRedirectTo = 'app.servicerequests.list';

    //make use of session storage
    $authProvider.storage = 'sessionStorage';

    //config ngAA profile key
    $authProvider.profileKey = 'party';

    //config signin url
    $authProvider.signinUrl = [ENV.apiEndPoint.web, 'signin'].join('/');

    //config signin template url
    $authProvider.signinTemplateUrl = 'views/auth/signin.html';

    //configure loading bar
    cfpLoadingBarProvider.includeSpinner = false;

    //configure numeraljs formating
    $numeraljsConfigProvider.register('locale', ENV.settings.locale, {
      abbreviations: ENV.settings.abbreviations,
    });

    //switch locale to sw
    $numeraljsConfigProvider.locale(ENV.settings.locale);

    //unmatched route handler
    $urlRouterProvider.otherwise('/servicerequests');

    //configure application states
    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'views/app.html',
        controller: 'AppCtrl',
        resolve: {
          party: function($auth) {
            return $auth.getProfile();
          },
          token: function($q, ngAAToken) {
            return $q.resolve(ngAAToken.getToken());
          },
        },
      })
      .state('app.manage', {
        abstract: true,
        templateUrl: 'views/manage/main.html',
      })
      .state('app.overviews', {
        url: '/overviews',
        templateUrl: 'views/dashboards/overviews/index.html',
        controller: 'DashboardOverviewCtrl',
        data: {
          authenticated: true,
        },
        resolve: {
          endpoints: function(Summary) {
            return Summary.endpoints({
              filter: {
                deletedAt: {
                  $eq: null,
                },
              },
            });
          },
        },
      })
      .state('app.standings', {
        url: '/standings',
        templateUrl: 'views/dashboards/standings.html',
        controller: 'DashboardStandingCtrl',
        data: {
          authenticated: true,
        },
        resolve: {
          endpoints: function(Summary) {
            return Summary.endpoints({
              filter: {
                deletedAt: {
                  $eq: null,
                },
              },
            });
          },
        },
      })
      .state('app.comparison', {
        //TODO refactor to reports states
        url: '/comparison',
        templateUrl: 'views/dashboards/comparison.html',
        controller: 'DashboardComparisonCtrl',
        data: {
          authenticated: true,
        },
      })
      .state('app.performances', {
        url: '/performances',
        templateUrl: 'views/dashboards/performance/index.html',
        controller: 'DashboardPerformanceCtrl',
        params: {
          jurisdiction: null,
          startedAt: null,
          endedAt: null,
        },
        data: {
          authenticated: true,
        },
        resolve: {
          endpoints: function(Summary) {
            return Summary.endpoints({
              filter: {
                deletedAt: {
                  $eq: null,
                },
              },
            });
          },
        },
      })
      .state('app.operations', {
        url: '/operations',
        templateUrl: 'views/dashboards/operation/index.html',
        controller: 'DashboardOperationCtrl',
        params: {
          jurisdiction: null,
          startedAt: null,
          endedAt: null,
        },
        data: {
          authenticated: true,
        },
        resolve: {
          endpoints: function(Summary) {
            return Summary.endpoints({
              filter: {
                deletedAt: {
                  $eq: null,
                },
              },
            });
          },
        },
      })
      .state('app.exports', {
        url: '/exports',
        templateUrl: 'views/dashboards/exports.html',
        controller: 'DashboardExportCtrl',
        data: {
          authenticated: true,
        },
        resolve: {
          endpoints: function(Summary) {
            return Summary.endpoints({
              filter: {
                deletedAt: {
                  $eq: null,
                },
              },
            });
          },
        },
      });
  })
  .run(function($rootScope, ngNotify, ENV) {
    //expose environment to $rootScope
    $rootScope.ENV = ENV;

    //configure ngNotify
    ngNotify.config({
      position: 'top',
      duration: 2000,
      button: true,
      theme: 'pastel',
    });
  });

'use strict';

angular.module('ng311')

.constant('ENV', {name:'production',owner:'DAWASA',author:'DAWASA',title:'DAWASA',version:'v0.1.0',description:'Citizen Feedback System',apiEndPoint:{web:'',mobile:''},socketEndPoint:{web:'',mobile:''},socketEnable:false,settings:{locale:'sw',name:'DAWASA',email:'lallyelias87@gmail.com',phone:'(000) 000 000 000',currency:'TZS',dateFormat:'dd/MM/yyyy',timeFormat:'hh:mm:ss',defaultPassword:'guest',abbreviations:{thousand:'K',million:'M',billion:'B',trillion:'T'}}})

;
'use strict';

/**
 *@description party authentication workflows configurations
 */
angular.module('ng311').config(function($stateProvider) {
  //party authentications flows states
  $stateProvider.state('app.profile', {
    url: '/profile',
    templateUrl: 'views/auth/profile.html',
    controller: 'AuthProfileCtrl',
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Utils
 * @description
 * # Utils
 * Factory in the ng311.
 */
angular.module('ng311').factory('Utils', function($window, ENV) {
  var utils = {};

  /**
   * @description convert provided path to link
   * @param  {String|Array} path valid url
   * @return {String}
   */
  utils.asLink = function(path) {
    if (!angular.isArray(path)) {
      path = [path];
    }
    var asLink = [ENV.apiEndPoint.web || $window.location.origin];
    asLink = asLink.concat(path);
    asLink = asLink.join('/');
    return asLink;
  };

  return utils;
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.socket
 * @description
 * # socket
 * Factory in the ng311.
 */
angular.module('ng311').factory('socket', function(ENV, Utils, socketFactory) {
  //no op socket
  var socket = {};

  if (ENV && ENV.socketEnable) {
    //socket endpoint
    var socketEndPoint = ENV.socketEndPoint || {}.web || Utils.asLink('');

    //initialize socket.io
    socket = socketFactory({
      ioSocket: io(socketEndPoint),
    });
  }

  return socket;
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Permission
 * @description
 * # Permission
 * Factory in ng311
 */
angular
  .module('ng311')
  .factory('Permission', function($http, $resource, Utils) {
    //create permission resource
    var Permission = $resource(
      Utils.asLink(['permissions', ':id']),
      {
        id: '@_id',
      },
      {
        update: {
          method: 'PUT',
        },
      }
    );

    /**
     * @description find permissions with pagination
     * @param  {Object} params [description]
     */
    Permission.find = function(params) {
      return $http
        .get(Utils.asLink('permissions'), {
          params: params,
        })
        .then(function(response) {
          //map plain permission object to resource instances
          var permissions = response.data.permissions.map(function(permission) {
            //create permission as a resource instance
            return new Permission(permission);
          });

          //return paginated response
          return {
            permissions: permissions,
            total: response.data.count,
          };
        });
    };

    return Permission;
  });

'use strict';

/**
 * @ngdoc service
 * @name ng311.Comment
 * @description
 * # Comment
 * Factory in the ng311.
 */
angular.module('ng311').factory('Comment', function($http, $resource, Utils) {
  //create comment resource
  var Comment = $resource(
    Utils.asLink(['comments', ':id']),
    {
      id: '@_id',
    },
    {
      update: {
        method: 'PUT',
      },
    }
  );

  /**
   * @description find comment with pagination
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Comment.find = function(params) {
    return $http
      .get(Utils.asLink('comments'), {
        params: params,
      })
      .then(function(response) {
        //map plain comment object to resource instances
        var comments = response.data.comments.map(function(comment) {
          //create comment as a resource instance
          return new Comment(comment);
        });

        //return paginated response
        return {
          comments: comments,
          total: response.data.count,
        };
      });
  };

  return Comment;
});

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:MainCtrl
 * @description root controller for all ng311 controllers
 * # MainCtrl
 * Controller of the ng311
 */
angular
  .module('ng311')
  .controller('MainCtrl', function(
    $rootScope,
    $scope,
    $state,
    ngNotify,
    ngToast,
    socket
  ) {
    //TODO show signin progress

    $scope.onAllIssues = function() {
      $rootScope.$broadcast('servicerequest:list');
    };

    //show app aside
    $rootScope.showAside = true;

    //handle fired error events
    function onError(event, error) {
      var message = 'Operation failed';

      if (error.status === -1) {
        message = 'No network connection';
      }

      try {
        message = error.message || error.data.message;
      } catch (e) {}

      ngNotify.set(message, {
        position: 'top',
        type: 'warn',
      });
    }

    //handle fired success events
    function onSuccess(event, success) {
      var message = 'Operation occured successfully';

      try {
        message = success.message;
      } catch (e) {}

      ngNotify.set(message, {
        position: 'top',
        type: 'success',
      });
    }

    //handle fired warning events
    function onWarning(event, warning) {
      var message = 'Operation Not Completed';

      try {
        message = warning.message;
      } catch (e) {}

      ngNotify.set(message, {
        position: 'top',
        type: 'warn',
        button: true,
        sticky: true,
        dismissButton: true,
      });
    }

    //listen errors and notify
    $rootScope.$on('appError', onError);
    $rootScope.$on('signinError', onError);

    //listen success and notify
    $rootScope.$on('appSuccess', onSuccess);

    //listen warning and notify
    $rootScope.$on('appWarning', onWarning);

    //TODO fire welcome message
    // $rootScope.$on('signinSuccess', onSuccess);

    /**
     * @description show and hide application aside
     */
    $scope.switch = function() {
      var pageAside = angular.element('.page-aside');
      var isOpen = pageAside.hasClass('open');

      if (isOpen) {
        pageAside.removeClass('open');
      } else {
        pageAside.addClass('open');
      }
    };

    /**
     * listen to signin success event
     */
    $rootScope.$on('signinSuccess', function(event, response) {
      //obtain signin party(user)
      var party = _.get(response, 'data.party');

      //if party is operator and has sipNumber
      //subscribe to web socket for call picked events
      if (socket && party && socket.on && party.sipNumber) {
        //ensure socket connection
        // socket.connect();

        //prepare sip socket event name
        $rootScope.sipEvent = ['socket:', party.sipNumber, '-call-picked'].join(
          ''
        );

        socket.on($rootScope.sipEvent, function(data) {
          //notify new call
          ngToast.create({
            className: 'info',
            content: 'New Call Received',
            dismissButton: true,
          });

          //broadcast call picked
          $rootScope.$broadcast('call picked', data);

          //TODO save latest call data on local storage for new
          //call creation
        });
      }
    });

    /**
     * listen to signout success event
     */
    $rootScope.$on('signoutSuccess', function() {
      //disconnect from call picked socket event
      if (socket && socket.disconnect) {
        if ($rootScope.sipEvent) {
          socket.removeListener($rootScope.sipEvent);
        }

        // socket.removeAllListeners();

        // socket.disconnect();
      }
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:AppCtrl
 * @description
 * # AppCtrl
 * Controller of the ng311
 */
angular
  .module('ng311')
  .controller('AppCtrl', function($rootScope, $scope, ENV, party) {
    //show app aside
    $rootScope.showAside = true;

    //adding current party into root scope and scope
    //so that it can be accessed in views and controllers
    $rootScope.party = party;
    $scope.party = $rootScope.party;

    //adding current applycation setting into root scope and scope
    //so that it can be accessed in views and controllers
    $rootScope.settings = angular.merge({}, ENV.settings, party.settings);
    $scope.settings = $rootScope.settings;

    $scope.$watch('$root.settings', function() {
      $scope.settings = $rootScope.settings;
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:AuthProfileCtrl
 * @description
 * # AuthProfileCtrl
 * Controller of the ng311
 */
angular
  .module('ng311')
  .controller('AuthProfileCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    $auth,
    $uibModal,
    Party,
    Summary
  ) {
    //signal if its editing process
    $scope.edit = false;

    $scope.canSave = true;

    $scope.passwordDontMatch = false;

    //use only editable properties
    $scope.party = new Party($rootScope.party);

    // create initial default filters
    var defaultFilters = {
      startedAt:
        $stateParams.startedAt ||
        moment()
          .utc()
          .startOf('date')
          .toDate(),
      endedAt:
        $stateParams.endedAt ||
        moment()
          .utc()
          .endOf('date')
          .toDate(),
    };

    $scope.filters = defaultFilters;

    //bind filters
    $scope.durationFilters = {
      durations: {
        day: {
          startedAt: moment()
            .utc()
            .startOf('date')
            .toDate(),
          endedAt: moment()
            .utc()
            .endOf('date')
            .toDate(),
        },
        week: {
          startedAt: moment()
            .utc()
            .startOf('week')
            .toDate(),
          endedAt: moment()
            .utc()
            .endOf('week')
            .toDate(),
        },
        month: {
          startedAt: moment()
            .utc()
            .startOf('month')
            .toDate(),
          endedAt: moment()
            .utc()
            .endOf('month')
            .toDate(),
        },
      },
    };

    $scope.workFilters = {
      durations: {
        day: {
          startedAt: moment()
            .utc()
            .startOf('date')
            .toDate(),
          endedAt: moment()
            .utc()
            .endOf('date')
            .toDate(),
        },
        week: {
          startedAt: moment()
            .utc()
            .startOf('week')
            .toDate(),
          endedAt: moment()
            .utc()
            .endOf('week')
            .toDate(),
        },
        month: {
          startedAt: moment()
            .utc()
            .startOf('month')
            .toDate(),
          endedAt: moment()
            .utc()
            .endOf('month')
            .toDate(),
        },
      },
    };

    $scope.onEdit = function() {
      $scope.edit = true;
    };

    $scope.onClose = function() {
      $scope.edit = false;
    };

    $scope.onConfirmPassword = function() {
      if (!$scope.party.confirm || !$scope.party.password) {
        $scope.passwordDontMatch = false;
      } else {
        $scope.passwordDontMatch = !(
          $scope.party.password === $scope.party.confirm
        );
        $scope.canSave =
          $scope.party.password.length >= 8 &&
          $scope.party.password === $scope.party.confirm;
      }
    };

    $scope.onPasswordChange = function() {
      if (!$scope.party.password) {
        $scope.canSave = true;
      } else {
        $scope.canSave =
          $scope.party.password.length >= 8 &&
          $scope.party.password === $scope.party.confirm;
      }
    };

    /**
     * @description save edited customer
     */
    $scope.save = function() {
      //check if password edited
      var passwordChanged = !!$scope.party.password;

      //TODO show input prompt
      //TODO show loading mask
      $scope.party
        .$update()
        .then(function(response) {
          if (passwordChanged) {
            //signout current party
            return $auth.signout();
          } else {
            return response;
          }
        })
        .then(function(response) {
          response = response || {};

          response.message =
            response.message || 'Profile details updated successfully';

          $scope.edit = false;

          $rootScope.$broadcast('appSuccess', response);

          if (passwordChanged) {
            $state.go('signin');
          } else {
            $state.go('app.profile');
          }
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
          $state.go('app.profile');
        });
    };

    $scope.performance = function() {
      var params = _.merge(
        {},
        { filter: $scope.params },
        {
          _id: $scope.party._id,
        }
      );

      Party.performances(params).then(function(response) {
        //TODO comment
        response.pipelines = _.chain(response.pipelines)
          .orderBy('label.weight', 'asc')
          .map(function(pipeline) {
            return _.merge(
              {},
              {
                displayColor:
                  _.get(pipeline, 'label.color', '#4BC0C0') + '!important',
              },
              pipeline
            );
          })
          .value();

        response.leaderboard = _.orderBy(response.leaderboard, 'count', 'desc');

        $scope.performances = response;
        $scope.performances.overall = {
          count: 10,
          pending: 5,
          resolved: 5,
          late: 0,
          target: 0,
        };
        $scope.performances.attendTime = {
          max: { days: 0, hours: 0, minutes: 0, seconds: 0 },
          min: { days: 0, hours: 0, minutes: 0, seconds: 0 },
          average: { days: 0, hours: 0, minutes: 0, seconds: 0 },
          target: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        };
        $scope.performances.resolveTime = {
          max: { days: 0, hours: 0, minutes: 0, seconds: 0 },
          min: { days: 0, hours: 0, minutes: 0, seconds: 0 },
          average: { days: 0, hours: 0, minutes: 0, seconds: 0 },
          target: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        };
        $scope.performances.breakdown = [
          {
            name: 'Billing',
            total: 14,
            open: 2,
            inprogress: 5,
            close: 2,
            resolved: 5,
          },
          {
            name: 'Water Leakage',
            total: 14,
            open: 2,
            inprogress: 5,
            close: 2,
            resolved: 5,
          },
          {
            name: 'Adjustment BTN',
            total: 14,
            open: 2,
            inprogress: 5,
            close: 2,
            resolved: 5,
          },
          {
            name: 'Un registered Customer',
            total: 14,
            open: 2,
            inprogress: 5,
            close: 2,
            resolved: 5,
          },
          {
            name: 'New Connection',
            total: 14,
            open: 2,
            inprogress: 5,
            close: 2,
            resolved: 5,
          },
          {
            name: 'Wrong Reading',
            total: 14,
            open: 2,
            inprogress: 5,
            close: 2,
            resolved: 5,
          },
          {
            name: 'Wrong Reading',
            total: 14,
            open: 2,
            inprogress: 5,
            close: 2,
            resolved: 5,
          },
          {
            name: 'Wrong Reading',
            total: 14,
            open: 2,
            inprogress: 5,
            close: 2,
            resolved: 5,
          },
          {
            name: 'Wrong Reading',
            total: 14,
            open: 2,
            inprogress: 5,
            close: 2,
            resolved: 5,
          },
          {
            name: 'Wrong Reading',
            total: 14,
            open: 2,
            inprogress: 5,
            close: 2,
            resolved: 5,
          },
          {
            name: 'Wrong Reading',
            total: 14,
            open: 2,
            inprogress: 5,
            close: 2,
            resolved: 5,
          },
        ];
      });
    };

    /**
     * Open date filters for profile reports
     */
    $scope.showFilter = function() {
      //open overview reports filter modal
      $scope.modal = $uibModal.open({
        templateUrl: 'views/auth/_partials/profile_filter.html',
        scope: $scope,
        size: 'lg',
      });

      //handle modal close and dismissed
      $scope.modal.result.then(
        function onClose(/*selectedItem*/) {},
        function onDismissed() {}
      );
    };

    /**
     * Filter profile reports based on on current selected filters
     * @param {Boolean} [reset] whether to clear and reset filter
     */
    $scope.filter = function(reset) {
      if (reset) {
        $scope.filters = defaultFilters;
      }

      $scope.params = Summary.prepareQuery($scope.filters);

      //load reports
      $scope.performance();

      //close current modal
      $scope.modal.close();
    };

    // $scope.performance();
  });

'use strict';

/**
 * @summary ShowIfState directive
 * @function
 * @public
 *
 * @description
 * This directive provides an attribute to show an element
 * when the current UI Router state matches the specified one.
 *
 * @param {Object} $state - ui router $state
 * @returns {Object} directive
 *
 * @example
 * <button show-if-state="main" ui-sref="settings">Settings</button>
 */
angular.module('ng311').directive('showIfState', function($state) {
  return {
    restrict: 'A',
    scope: {
      showIfState: '@',
    },
    link: function(scope, element) {
      scope.$watch(
        function() {
          return $state.is(scope.showIfState);
        },
        function(isState) {
          if (isState) {
            element.css('display', 'inherit');
          } else {
            element.css('display', 'none');
          }
        }
      );
    },
  };
});

/**
 * @summary HideIfState directive
 * @function
 * @public
 *
 * @description
 * This directive provides an attribute to hide an element
 * when the current UI Router state matches the specified one.
 *
 * @param {Object} $state - ui router $state
 * @returns {Object} directive
 *
 * @example
 * <button hide-if-state="settings" ui-sref="main">Go Back</button>
 */
angular.module('ng311').directive('hideIfState', function($state) {
  return {
    restrict: 'A',
    scope: {
      hideIfState: '@',
    },
    link: function(scope, element) {
      scope.$watch(
        function() {
          return $state.is(scope.hideIfState);
        },
        function(isState) {
          if (isState) {
            element.css('display', 'none');
          } else {
            element.css('display', 'inherit');
          }
        }
      );
    },
  };
});

'use strict';

/**
 * @ngdoc directive
 * @name ng311.directive:LetterAvatar
 * @description
 * # LetterAvatar
 */
angular.module('ng311').directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function(event) {
      if (event.which === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });

        event.preventDefault();
      }
    });
  };
});

'use strict';

/**
 * @ngdoc directive
 * @name ng311.directive:LetterAvatar
 * @description
 * # LetterAvatar
 */
angular.module('ng311').directive('letterAvatar', function() {
  /* jshint ignore:start */
  //default settings
  var defaultSettings = {
    alphabetcolors: [
      '#5A8770',
      '#B2B7BB',
      '#6FA9AB',
      '#F5AF29',
      '#0088B9',
      '#F18636',
      '#D93A37',
      '#A6B12E',
      '#5C9BBC',
      '#F5888D',
      '#9A89B5',
      '#407887',
      '#9A89B5',
      '#5A8770',
      '#D33F33',
      '#A2B01F',
      '#F0B126',
      '#0087BF',
      '#F18636',
      '#0087BF',
      '#B2B7BB',
      '#72ACAE',
      '#9C8AB4',
      '#5A8770',
      '#EEB424',
      '#407887',
    ],
    textColor: '#ffffff',
    defaultBorder: 'border:5px solid white',
    fontsize: 30, // unit in pixels
    height: 50, // unit in pixels
    width: 50, // unit in pixels
    fontWeight: 400, //
    charCount: 1,
    fontFamily:
      'Lato,HelveticaNeue-Light,Helvetica Neue Light,Helvetica Neue,Helvetica, Arial,Lucida Grande, sans-serif',
    base: 'data:image/svg+xml;base64,',
    radius: 'border-radius:50%;',
  };

  function getRandomColors() {
    var letters = '0123456789ABCDEF'.split('');
    var _color = '#';
    for (var i = 0; i < 6; i++) {
      _color += letters[Math.floor(Math.random() * 16)];
    }
    return _color;
  }

  function isNotNull(obj) {
    if (obj) {
      return true;
    }
    return false;
  }

  function getImgTag(width, height, color) {
    var svgTag = angular
      .element('<svg></svg>')
      .attr({
        xmlns: 'http://www.w3.org/2000/svg',
        'pointer-events': 'none',
        width: width,
        height: height,
      })
      .css({
        'background-color': color,
        width: width + 'px',
        height: height + 'px',
      });

    return svgTag;
  }

  function getCharacterObject(
    character,
    textColor,
    fontFamily,
    fontWeight,
    fontsize
  ) {
    var textTag = angular
      .element('<text text-anchor="middle"></text>')
      .attr({
        y: '50%',
        x: '50%',
        dy: '0.35em',
        'pointer-events': 'auto',
        fill: textColor,
        'font-family': fontFamily,
      })
      .html(character)
      .css({
        'font-weight': fontWeight,
        'font-size': fontsize + 'px',
      });

    return textTag;
  }

  return {
    restrict: 'AE',
    replace: true,
    scope: {
      alphabetcolors: '=alphabetcolors',
    },
    link: function(scope, element, attrs) {
      var params = {
        charCount: isNotNull(attrs.charcount)
          ? attrs.charcount
          : defaultSettings.charCount,
        data: attrs.data,
        textColor: defaultSettings.textColor,
        height: isNotNull(attrs.height) ? attrs.height : defaultSettings.height,
        width: isNotNull(attrs.width) ? attrs.width : defaultSettings.width,
        fontsize: isNotNull(attrs.fontsize)
          ? attrs.fontsize
          : defaultSettings.fontsize,
        fontWeight: isNotNull(attrs.fontweight)
          ? attrs.fontweight
          : defaultSettings.fontWeight,
        fontFamily: isNotNull(attrs.fontfamily)
          ? attrs.fontfamily
          : defaultSettings.fontFamily,
        avatarBorderStyle: attrs.avatarcustomborder,
        avatardefaultBorder: attrs.avatarborder,
        defaultBorder: defaultSettings.defaultBorder,
        shape: attrs.shape,
        color: attrs.color,
        clazz: attrs.class,
        alphabetcolors: scope.alphabetcolors || defaultSettings.alphabetcolors,
        title: attrs.title,
      };

      var c = params.data.substr(0, params.charCount).toUpperCase();
      var cobj = getCharacterObject(
        c,
        params.textColor,
        params.fontFamily,
        params.fontWeight,
        params.fontsize
      );
      var colorIndex = '';
      var color = params.color;

      if (!color) {
        if (c.charCodeAt(0) < 65) {
          color = getRandomColors();
        } else {
          var seed = Math.ceil(Math.random() * 99);
          colorIndex = Math.floor(
            (c.charCodeAt(0) + seed) % params.alphabetcolors.length
          );
          color = params.alphabetcolors[colorIndex];
        }
      }

      var svg = getImgTag(params.width, params.height, color);
      svg.append(cobj);
      var lvcomponent = angular
        .element('<div>')
        .append(svg.clone())
        .html();

      var svgHtml = window.btoa(unescape(encodeURIComponent(lvcomponent)));
      var component;
      var base = defaultSettings.base;
      var _style = '';
      if (params.avatarBorderStyle) {
        _style = params.avatarBorderStyle;
      } else if (params.avatardefaultBorder) {
        _style = params.defaultBorder;
      }

      if (params.shape) {
        if (params.shape === 'round') {
          var roundStyle = defaultSettings.radius + _style;
          component =
            '<img src=' +
            base +
            svgHtml +
            ' style="' +
            roundStyle +
            '" class="' +
            params.clazz +
            '" title="' +
            params.title +
            '"/>';
        }
      } else {
        component =
          '<img src=' +
          base +
          svgHtml +
          ' style="' +
          _style +
          '" class="' +
          params.clazz +
          '" />';
      }
      element.replaceWith(component);
    },
  };

  /* jshint ignore:end */
});

'use strict';

(function() {
  function ngGallery($document, $timeout, $q, $templateCache) {
    var defaults = {
      baseClass: 'ng-gallery',
      thumbClass: 'ng-thumb',
      templateUrl: 'ng-gallery.html',
    };

    var keysCodes = {
      enter: 13,
      esc: 27,
      left: 37,
      right: 39,
    };

    function setScopeValues(scope /*, attrs*/) {
      scope.baseClass = scope.class || defaults.baseClass;
      scope.thumbClass = scope.thumbClass || defaults.thumbClass;
      scope.thumbsNum = scope.thumbsNum || 3; // should be odd
    }

    var templateUrl = defaults.templateUrl;
    // Set the default template
    $templateCache.put(
      templateUrl,
      '<div class="{{ baseClass }}">' +
        '  <div ng-repeat="i in images">' +
        '    <img data-ng-src="{{ i.thumb }}" class="{{ thumbClass }}" ng-click="openGallery($index)" alt="{{i.name}}" title="{{i.caption}}" />' +
        '  </div>' +
        '</div>' +
        '<div class="ng-overlay" ng-show="opened">' +
        '</div>' +
        '<div class="ng-gallery-content" unselectable="on" ng-show="opened" ng-swipe-left="nextImage()" ng-swipe-right="prevImage()">' +
        '  <div class="uil-ring-css" ng-show="loading"><div></div></div>' +
        '  <a class="close-popup" ng-click="closeGallery()" title="Close"><i class="ti-close"></i></a>' +
        '  <a class="nav-left" ng-click="prevImage()" title="Previous"><i class="ti-angle-left"></i></a>' +
        '  <img ondragstart="return false;" draggable="false" data-ng-src="{{ img }}" ng-click="nextImage()" ng-show="!loading" class="effect" />' +
        '  <a class="nav-right" ng-click="nextImage()" title="Next"><i class="ti-angle-right"></i></a>' +
        '  <span class="info-text">{{ index + 1 }}/{{ images.length }} - {{ description }}</span>' +
        '  <div class="ng-thumbnails-wrapper">' +
        '    <div class="ng-thumbnails slide-left">' +
        '      <div ng-repeat="i in images">' +
        '        <img data-ng-src="{{ i.thumb }}" ng-class="{\'active\': index === $index}" ng-click="changeImage($index)" />' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );

    return {
      restrict: 'EA',
      scope: {
        images: '=',
        upload: '=',
        allowUpload: '=',
        onUpload: '=',
        onRemove: '=',
        thumbsNum: '@',
        hideOverflow: '=',
      },
      controller: [
        '$scope',
        function($scope) {
          $scope.$on('openGallery', function(e, args) {
            $scope.openGallery(args.index);
          });
        },
      ],
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || defaults.templateUrl;
      },
      link: function(scope, element, attrs) {
        setScopeValues(scope, attrs);

        if (scope.thumbsNum >= 11) {
          scope.thumbsNum = 11;
        }

        var $body = $document.find('body');
        var $thumbwrapper = angular.element(
          element[0].querySelectorAll('.ng-thumbnails-wrapper')
        );
        var $thumbnails = angular.element(
          element[0].querySelectorAll('.ng-thumbnails')
        );

        scope.index = 0;
        scope.opened = false;

        scope.thumbWrapperWidth = 0;
        scope.thumbsWidth = 0;

        var calculateThumbsWidth = function() {
          var width = 0,
            visibleWidth = 0;
          angular.forEach($thumbnails.find('img'), function(thumb) {
            width += thumb.clientWidth;
            width += 10; // margin-right
            visibleWidth = thumb.clientWidth + 10;
          });
          return {
            width: width,
            visibleWidth: visibleWidth * scope.thumbsNum,
          };
        };

        var smartScroll = function(index) {
          $timeout(function() {
            var len = scope.images.length,
              width = scope.thumbsWidth,
              itemScroll = parseInt(width / len, 10),
              i = index + 1,
              s = Math.ceil(len / i);

            $thumbwrapper[0].scrollLeft = 0;
            $thumbwrapper[0].scrollLeft = i * itemScroll - s * itemScroll;
          }, 100);
        };

        var showImage = function(i) {
          var img = scope.images[i];
          if (img) {
            scope.img = scope.images[i].thumb;
            smartScroll(scope.index);
          }
          scope.description = scope.images[i].description || '';
        };

        scope.showImageDownloadButton = function() {
          if (
            scope.images[scope.index] === null ||
            scope.images[scope.index].downloadSrc === null
          ) {
            return;
          }
          var image = scope.images[scope.index];
          return (
            angular.isDefined(image.downloadSrc) && 0 < image.downloadSrc.length
          );
        };

        scope.whenRemove = function() {
          if (scope.images[scope.index] === null) {
            return;
          } else {
            scope.onRemove(scope.images[scope.index]);
            scope.closeGallery();
          }
        };

        scope.changeImage = function(i) {
          scope.index = i;
          showImage(i);
        };

        scope.nextImage = function() {
          scope.index += 1;
          if (scope.index === scope.images.length) {
            scope.index = 0;
          }
          showImage(scope.index);
        };

        scope.prevImage = function() {
          scope.index -= 1;
          if (scope.index < 0) {
            scope.index = scope.images.length - 1;
          }
          showImage(scope.index);
        };

        scope.openGallery = function(i) {
          if (typeof i !== undefined) {
            scope.index = i;
            showImage(scope.index);
          }
          scope.opened = true;
          if (scope.hideOverflow) {
            angular.element('body').css({ overflow: 'hidden' });
          }

          $timeout(function() {
            var calculatedWidth = calculateThumbsWidth();
            scope.thumbsWidth = calculatedWidth.width;
            //Add 1px, otherwise some browsers move the last image into a new line
            var thumbnailsWidth = calculatedWidth.width + 1;
            $thumbnails.css({ width: thumbnailsWidth + 'px' });
            $thumbwrapper.css({
              width: calculatedWidth.visibleWidth + 'px',
            });
            smartScroll(scope.index);
          });
        };

        scope.closeGallery = function() {
          scope.opened = false;
          if (scope.hideOverflow) {
            angular.element('body').css({ overflow: '' });
          }
        };

        $body.bind('keydown', function(event) {
          if (!scope.opened) {
            return;
          }
          var which = event.which;
          if (which === keysCodes.esc) {
            scope.closeGallery();
          } else if (which === keysCodes.right || which === keysCodes.enter) {
            scope.nextImage();
          } else if (which === keysCodes.left) {
            scope.prevImage();
          }

          scope.$apply();
        });
      },
    };
  }

  angular.module('ng311').directive('ngGallery', ngGallery);

  ngGallery.$inject = ['$document', '$timeout', '$q', '$templateCache'];
})();

'use strict';

/**
 * @ngdoc service request
 * @name ng311.ServiceRequest
 * @description
 * # ServiceRequest
 * Factory in the ng311.
 */
angular
  .module('ng311')
  .factory('ServiceRequest', function(
    $http,
    $resource,
    $filter,
    Utils,
    Mailto,
    Upload
  ) {
    //create servicerequest resource
    var ServiceRequest = $resource(
      Utils.asLink(['servicerequests', ':id']),
      {
        id: '@_id',
      },
      {
        update: {
          method: 'PUT',
        },
      }
    );

    /**
     * @description find servicerequest with pagination
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    ServiceRequest.find = function(params) {
      return $http
        .get(Utils.asLink('servicerequests'), {
          params: params,
        })
        .then(function(response) {
          //map plain servicerequest object to resource instances
          var servicerequests = response.data.servicerequests.map(function(
            servicerequest
          ) {
            //create servicerequest as a resource instance
            return new ServiceRequest(servicerequest);
          });

          //return paginated response
          return {
            servicerequests: servicerequests,
            total: response.data.count,
            pages: response.data.pages,
          };
        });
    };

    /**
     * @description patch service request with specific changes
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    ServiceRequest.changelog = function(id, changelog) {
      var url = Utils.asLink(['servicerequests', id, 'changelogs']);

      return Upload.upload({
        url: url,
        data: changelog,
      }).then(function(response) {
        return new ServiceRequest(response.data);
      });
    };

    /**
     * @description convert a report to email
     * @param  {Object} report current report in the scope
     * @return {String} valid mailto string to bind into href
     */
    ServiceRequest.toEmail = function(issue) {
      /*jshint camelcase:false */

      //prepare complaint address
      var address = '';
      if (issue.reporter.account) {
        address = address + issue.reporter.account;
      }
      if (issue.address) {
        if (address) {
          address = address + '/' + issue.address;
        } else {
          address = address + issue.address;
        }
      }

      var time = 'N/A';
      var date = 'N/A';
      try {
        time = $filter('date')(issue.createdAt, 'hh:mm:ss a');
        date = $filter('date')(issue.createdAt, 'dd/MM/yyyy');
      } catch (error) {}

      //prepare e-mail body
      var body = [
        'Hello,',
        '\n\n',
        'Please assist in resolving customer complaint #',
        issue.code || 'N/A',
        '.',
        '\n\n',
        'Time: ',
        time || 'N/A',
        '\n',
        'Date: ',
        date || 'N/A',
        '\n',
        'Account Number/Location: ',
        address || 'N/A',
        '\n',
        'Area: ',
        (issue.jurisdiction || {}).name || 'N/A',
        '\n',
        'Customer Name: ',
        issue.reporter.name || 'N/A',
        '\n',
        'Phone No.: ',
        issue.reporter.phone || 'N/A',
        '\n',
        'Nature of Complaint: ',
        issue.service.name || 'N/A',
        '\n',
        'Complaint Details: ',
        issue.description || 'N/A',
        '\n\n',
        'Regards.',
      ].join('');

      //add internal notes
      var changelogs = _.orderBy(
        [].concat(issue.changelogs),
        'createdAt',
        'desc'
      );
      var notes = _.map(changelogs, function(changelog) {
        var note = [];

        //handle changelog
        if (changelog.comment) {
          note = note.concat(
            [
              changelog.changer.name,
              ' on ',
              $filter('date')(changelog.createdAt, 'dd MMM yyyy hh:mm:ss a'),
              ': ',
              'Write: ',
              changelog.comment,
            ].join('')
          );
        }

        //handle status
        if (changelog.status) {
          note = note.concat(
            [
              changelog.changer.name,
              ' on ',
              $filter('date')(changelog.createdAt, 'dd MMM yyyy hh:mm:ss a'),
              ': ',
              'Change status to ',
              changelog.status.name,
            ].join('')
          );
        }

        //handle priority
        if (changelog.priority) {
          note = note.concat(
            [
              changelog.changer.name,
              ' on ',
              $filter('date')(changelog.createdAt, 'dd MMM yyyy hh:mm:ss a'),
              ': ',
              'Change priority to ',
              changelog.priority.name,
            ].join('')
          );
        }

        //handle assignee
        if (changelog.assignee) {
          note = note.concat(
            [
              changelog.changer.name,
              ' on ',
              $filter('date')(changelog.createdAt, 'dd MMM yyyy hh:mm:ss a'),
              ': ',
              'Assignee to ',
              changelog.assignee.name,
            ].join('')
          );
        }

        //handle resolved
        if (changelog.resolvedAt) {
          note = note.concat(
            [
              changelog.changer.name,
              ' on ',
              $filter('date')(changelog.createdAt, 'dd MMM yyyy hh:mm:ss a'),
              ': ',
              'Change status to ',
              'Resolved',
            ].join('')
          );
        }

        //handle resolved
        if (changelog.reopenedAt) {
          note = note.concat(
            [
              changelog.changer.name,
              ' on ',
              $filter('date')(changelog.createdAt, 'dd MMM yyyy hh:mm:ss a'),
              ': ',
              'Change status to ',
              'Reopened',
            ].join('')
          );
        }

        note = _.filter(note, function(line) {
          return !_.isEmpty(line);
        });
        note = note.length > 0 ? note.join(',\n') : undefined;
        return note;
      });

      notes = _.compact(notes);

      body = body + '\n\n' + 'Change Logs: ' + '\n\n' + notes.join(',\n');

      //TODO add a link to actual problem

      //prepare e-mail send option
      var recipient = _.get(issue, 'jurisdiction.email', '');
      var options = {
        subject: [issue.service.name, issue.code].join(' - #'),
        body: body,
      };
      /*jshint camelcase:true*/

      var href = Mailto.url(recipient, options);

      return href;
    };

    return ServiceRequest;
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ServiceRequestCreateCtrl
 * @description
 * # ServiceRequestCreateCtrl
 * ServiceRequest create controller of ng311
 */
angular
  .module('ng311')
  .controller('ServiceRequestCreateCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    Account,
    ServiceRequest,
    endpoints,
    party,
    Jurisdiction,
    Service
  ) {
    //action performed by this controller
    $scope.action = 'Create';

    $scope.edit = true;

    $scope.groups = endpoints.servicegroups.servicegroups;
    $scope.methods = party.settings.servicerequest.webMethods;

    //instantiate new service request
    var servicerequest = _.merge(
      {},
      {
        _id: ($stateParams || {})._id,
        call: {
          startedAt: new Date(),
        },
        reporter: ($stateParams || {}).reporter || {},
        jurisdiction: ($stateParams || {}).jurisdiction,
        service: ($stateParams || {}).service,
        description: ($stateParams || {}).description,
        address: ($stateParams || {}).address,
        method: _.merge({}, { name: undefined }, ($stateParams || {}).method),
      }
    );

    $scope.servicerequest = new ServiceRequest(servicerequest);

    /**
     * @description save created servicerequest
     */
    $scope.save = function() {
      $scope.create = false;
      $scope.updated = true;

      //set call end time
      if (!$scope.servicerequest._id) {
        $scope.servicerequest.call.endedAt = new Date();
      }

      //ensure operator on attending
      if (!$scope.servicerequest.operator) {
        $scope.servicerequest.operator = party ? party._id : undefined;
      }

      //try update or save servicerequest
      var updateOrSave = !$scope.servicerequest._id
        ? $scope.servicerequest.$save()
        : $scope.servicerequest.$update();

      updateOrSave
        .then(function(response) {
          response = response || {};

          response.message =
            response.message || 'Service Request Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('servicerequest:create:success', response);

          // $rootScope.$broadcast('app:servicerequests:reload');

          $state.go('app.servicerequests.list');
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
          $rootScope.$broadcast('servicerequest:create:error', error);
        });
    };

    $scope.searchJurisdictions = function(query) {
      return Jurisdiction.find({
        q: query,
        filter: {
          deletedAt: {
            $eq: null,
          },
        },
      }).then(function(response) {
        return response.jurisdictions;
      });
    };

    $scope.searchServices = function(query) {
      return Service.find({
        q: query,
        filter: {
          deletedAt: {
            $eq: null,
          },
        },
      }).then(function(response) {
        return response.services;
      });
    };

    /**
     * @description Launch a customer lookup details in a modal window
     * @function
     * @name openLookModal
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.openLookupModal = function() {
      var accountNumber = $scope.servicerequest.reporter.account;

      Account.getDetails(accountNumber).then(function(account) {
        account = account || {};

        // ensure bill exists
        var bills = _.get(account, 'bills', undefined);

        if (bills) {
          var _bills = _.orderBy(bills, 'period.billedAt', 'desc');
          account = _.merge({}, account, { bills: _bills });

          /* pick closing balance of the latest bill */
          account = _.merge({}, account, {
            closingBalance: _.first(account.bills).balance.close,
          });
        }

        $rootScope.account = account;
        $scope.servicerequest.reporter = _.merge(
          {},
          {
            name: account.name,
            email: account.email,
          },
          $scope.servicerequest.reporter
        );

        $scope.servicerequest.jurisdiction =
          $scope.servicerequest.jurisdiction || account.jurisdiction;
        $scope.servicerequest.address =
          $scope.servicerequest.address || account.address;
        $scope.servicerequest.location = account.location;
        $state.go('account.details');
      });
    };
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ServiceRequestIndexCtrl
 * @description
 * # ServiceRequestIndexCtrl
 * ServiceRequest list controller of ng311
 */
angular
  .module('ng311')
  .controller('ServiceRequestIndexCtrl', function(
    $rootScope,
    $scope,
    $state,
    ServiceRequest
  ) {
    //servicerequests in the scope
    $scope.spin = false;
    $scope.busy = false;
    $scope.servicerequests = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * @description load servicerequests
     */
    $scope.find = function() {
      //start show spinner
      $scope.spin = true;
      $scope.busy = true;

      ServiceRequest.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1,
        },
        filter: {
          'relation.name': 'Internal',
        },
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with servicerequests when done loading
          $scope.servicerequests = response.servicerequests;
          $scope.total = response.total;
          $scope.page = response.page;
          $scope.spin = false;
          $scope.busy = false;
        })
        .catch(function(error) {
          $scope.spin = false;
          $scope.busy = false;
        });
    };

    //check whether servicerequests will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.servicerequests && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //pre load servicerequests on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:servicerequests:reload', function() {
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ServiceRequestMainCtrl
 * @description
 * # ServiceRequestMainCtrl
 * ServiceRequest main controller of ng311
 */
angular
  .module('ng311')
  .controller('ServiceRequestMainCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    $uibModal,
    prompt,
    leafletBoundsHelpers,
    Utils,
    Party,
    ServiceRequest,
    Comment,
    Summary,
    endpoints,
    party,
    items
  ) {
    //servicerequests in the scope
    $scope.spin = false;
    $scope.servicerequests = [];
    $scope.comments = [];
    $scope.worklogs = [];
    $scope.worklog = {};
    $scope.servicerequest = new ServiceRequest({
      call: {
        startedAt: new Date(),
      },
    });
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;
    $scope.note = {};
    $scope.updated = false;
    $scope.dateFilters = {
      reportedAt: {
        from: moment()
          .utc()
          .startOf('date')
          .toDate(),
        to: moment()
          .utc()
          .startOf('date')
          .toDate(),
      },
      resolvedAt: {
        from: moment()
          .utc()
          .startOf('date')
          .toDate(),
        to: moment()
          .utc()
          .startOf('date')
          .toDate(),
      },
    };

    $scope.search = {};
    $scope.map = {};
    $scope.assignees = [];
    $scope.isOperatorFilter = true;

    //signal create mode
    $scope.create = false;

    //track current misc filter(all, inbox, unattended, unresolved, resolved)
    $scope.misc = 'inbox';

    //bind states
    $scope.priorities = endpoints.priorities.priorities;
    $scope.statuses = endpoints.statuses.statuses;
    $scope.services = endpoints.services.services;
    $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;
    $scope.items = items.items;
    $scope.party = party;
    // $scope.assignees = assignee.parties;
    $scope.summaries = endpoints.summaries;

    //listen for create event
    $rootScope.$on('servicerequest:create', function() {
      $scope.servicerequest = new ServiceRequest({
        call: {
          startedAt: new Date(),
        },
      });
      $scope.create = true;
    });

    $rootScope.$on('servicerequest:list', function() {
      $scope.find();
      $scope.create = false;
    });

    /**
     * listen for received call picked events and filter
     * issue list based on reporter details(i.e phone number)
     */
    var callPickedDeregister = $rootScope.$on('call picked', function(
      event,
      data
    ) {
      if (data && data.phone) {
        $scope.filterByReporter(data.phone, {
          'reporter.phone': data.phone,
        });
      }
    });
    $scope.$on('$destroy', callPickedDeregister);

    /**
     * set current service request
     */
    $scope.select = function(servicerequest) {
      //clear note
      $scope.note = {};

      //clear comments
      $scope.comments = [];

      // clear worklog
      $scope.worklog = {};

      // clear worklogs
      $scope.worklogs = [];

      //sort comments in desc order
      if (servicerequest && servicerequest._id) {
        //update scope service request ref
        $scope.servicerequest = servicerequest;

        $scope.mailTo = ServiceRequest.toEmail(servicerequest);

        //update markers & map center
        if (servicerequest.location && servicerequest.location.coordinates) {
          // obtain longitude and latitude
          var longitude = servicerequest.location.coordinates[0];
          var latitude = servicerequest.location.coordinates[1];

          //prepare bounds
          var bounds = leafletBoundsHelpers.createBoundsFromArray([
            [latitude + 0.029, longitude],
            [latitude - 0.029, longitude],
          ]);

          //set marker point
          $scope.map = {
            bounds: bounds,
            markers: {
              servicerequest: {
                lat: latitude,
                lng: longitude,
                focus: true,
                draggable: false,
              },
            },
            center: {
              lat: latitude,
              lng: longitude,
              zoom: 1,
            },
            defaults: {
              scrollWheelZoom: false,
            },
          };
        }

        // load service request worklogs
        $scope.loadWorkLog(servicerequest);

        //load service request images
        $scope.loadImages(servicerequest);

        //load service request documents
        $scope.loadDocuments(servicerequest);

        //load service request comments
        $scope.loadComment(servicerequest);
      }

      $scope.create = false;
    };

    /**
     * cancel create operation
     */
    $scope.cancel = function() {
      // $scope.servicerequest = _.first($scope.servicerequests);
      $scope.select(_.first($scope.servicerequests));
      $scope.create = false;
    };

    /**
     * assign a person to work on the issue
     */
    $scope.assign = function(assignee) {
      if (assignee) {
        $scope.servicerequest.assignee = assignee._id;
        if (!$scope.servicerequest.resolvedAt) {
          var changelog = {
            //TODO flag internal or public
            changer: party._id,
            assignee: $scope.servicerequest.assignee,
            //TODO: set notify to true
          };

          //update changelog
          var _id = $scope.servicerequest._id;
          ServiceRequest.changelog(_id, changelog).then(function(response) {
            $scope.modal.close();
            // $scope.servicerequest = response;
            $scope.select(response);
            $scope.updated = true;
            $rootScope.$broadcast('app:servicerequests:reload');
          });
        }
      }
    };

    /**
     * comment on the issues
     */
    $scope.comment = function() {
      //TODO notify about the comment saved
      if ($scope.note && $scope.note.content) {
        var changelog = {
          //TODO flag internal or public
          changer: party._id,
          comment: $scope.note.content,
        };

        //update changelog
        var _id = $scope.servicerequest._id;
        ServiceRequest.changelog(_id, changelog)
          .then(function(response) {
            //TODO notify success
            $scope.note = {};
            $scope.select(response);
            $scope.updated = true;
          })
          .catch(function(error) {
            //TODO notify error
            // console.log(error);
          });
      }
    };

    /**
     * attach image on issues
     */
    $scope.onImage = function(image) {
      if (image) {
        var changelog = {
          //TODO flag internal or public
          changer: party._id,
          image: image,
        };

        //update changelog
        var _id = $scope.servicerequest._id;
        ServiceRequest.changelog(_id, changelog)
          .then(function(response) {
            //TODO notify success
            $scope.note = {};
            $scope.select(response);
            $scope.updated = true;
          })
          .catch(function(error) {
            //TODO notify error
            // console.log(error);
          });
      }
    };

    /**
     * attach document on issues
     */
    $scope.onDocument = function(doc) {
      if (document) {
        var changelog = {
          //TODO flag internal or public
          changer: party._id,
          document: doc,
        };

        //update changelog
        var _id = $scope.servicerequest._id;
        ServiceRequest.changelog(_id, changelog)
          .then(function(response) {
            //TODO notify success
            $scope.note = {};
            $scope.select(response);
            $scope.updated = true;
          })
          .catch(function(error) {
            //TODO notify error
            // console.log(error);
          });
      }
    };

    /**
     * change issue priority
     */
    $scope.changePriority = function(priority) {
      if (priority._id === $scope.servicerequest.priority._id) {
        return;
      }

      if (priority) {
        $scope.servicerequest.priority = priority;
      }

      if (!$scope.servicerequest.resolvedAt) {
        var changelog = {
          //TODO flag internal or public
          changer: party._id,
          priority: $scope.servicerequest.priority,
        };
        var _id = $scope.servicerequest._id;

        ServiceRequest.changelog(_id, changelog).then(function(response) {
          // $scope.servicerequest = response;
          $scope.select(response);
          $scope.updated = true;
          $rootScope.$broadcast('app:servicerequests:reload');
        });
      }
    };

    /**
     * change issue status
     */
    $scope.changeStatus = function(status) {
      if (status._id === $scope.servicerequest.status._id) {
        return;
      }

      if (status) {
        $scope.servicerequest.status = status;
      }

      if (!$scope.servicerequest.resolvedAt) {
        var changelog = {
          //TODO flag internal or public
          changer: party._id,
          status: $scope.servicerequest.status,
        };
        var _id = $scope.servicerequest._id;

        ServiceRequest.changelog(_id, changelog).then(function(response) {
          // $scope.servicerequest = response;
          $scope.select(response);
          $scope.updated = true;
          $rootScope.$broadcast('app:servicerequests:reload');
        });
      }
    };

    /**
     * complete issue and signal work done
     */
    $scope.onComplete = function() {
      prompt({
        title: 'Complete Issue',
        message: 'Are you sure you want to mark this issue as completed?',
        buttons: [
          {
            label: 'Yes',
            primary: true,
          },
          {
            label: 'No',
            cancel: true,
          },
        ],
      })
        .then(function() {
          if (!$scope.servicerequest.completedAt) {
            var changelog = {
              //TODO flag internal or public
              changer: party._id,
              completedAt: new Date(),
            };

            //update changelog
            var _id = $scope.servicerequest._id;
            ServiceRequest.changelog(_id, changelog).then(function(response) {
              // $scope.servicerequest = response;
              $scope.select(response);
              $scope.updated = true;
              $rootScope.$broadcast('app:servicerequests:reload');

              response = response || {};

              response.message =
                response.message || 'Issue Marked As Completed';

              $rootScope.$broadcast('appSuccess', response);
            });
          }
        })
        .catch(function() {});
    };

    /**
     * attend issue and signal work in progress
     */
    $scope.onAttended = function() {
      prompt({
        title: 'Attend Issue',
        message: 'Are you sure you want to attend this issue?',
        buttons: [
          {
            label: 'Yes',
            primary: true,
          },
          {
            label: 'No',
            cancel: true,
          },
        ],
      })
        .then(function() {
          if (!$scope.servicerequest.attendedAt) {
            var changelog = {
              //TODO flag internal or public
              changer: party._id,
              attendedAt: new Date(),
            };

            //update changelog
            var _id = $scope.servicerequest._id;
            ServiceRequest.changelog(_id, changelog).then(function(response) {
              // $scope.servicerequest = response;
              $scope.select(response);
              $scope.updated = true;
              $rootScope.$broadcast('app:servicerequests:reload');

              response = response || {};

              response.message = response.message || 'Issue Marked As Attended';

              $rootScope.$broadcast('appSuccess', response);
            });
          }
        })
        .catch(function() {});
    };

    /**
     * verify issue and signal work done is ok
     */
    $scope.onVerify = function() {
      prompt({
        title: 'Verify Issue',
        message: 'Are you sure you want to mark this issue as verified?',
        buttons: [
          {
            label: 'Yes',
            primary: true,
          },
          {
            label: 'No',
            cancel: true,
          },
        ],
      })
        .then(function() {
          if (!$scope.servicerequest.vefifiedAt) {
            var changelog = {
              //TODO flag internal or public
              changer: party._id,
              verifiedAt: new Date(),
            };

            //update changelog
            var _id = $scope.servicerequest._id;
            ServiceRequest.changelog(_id, changelog).then(function(response) {
              // $scope.servicerequest = response;
              $scope.select(response);
              $scope.updated = true;
              $rootScope.$broadcast('app:servicerequests:reload');

              response = response || {};

              response.message = response.message || 'Issue Marked As Verified';

              $rootScope.$broadcast('appSuccess', response);
            });
          }
        })
        .catch(function() {});
    };

    /**
     * approve issue and signal work done final
     */
    $scope.onApprove = function() {
      prompt({
        title: 'Approve Issue',
        message: 'Are you sure you want to mark this issue as approved?',
        buttons: [
          {
            label: 'Yes',
            primary: true,
          },
          {
            label: 'No',
            cancel: true,
          },
        ],
      })
        .then(function() {
          if (!$scope.servicerequest.vefifiedAt) {
            var changelog = {
              //TODO flag internal or public
              changer: party._id,
              approvedAt: new Date(),
            };

            //update changelog
            var _id = $scope.servicerequest._id;
            ServiceRequest.changelog(_id, changelog).then(function(response) {
              // $scope.servicerequest = response;
              $scope.select(response);
              $scope.updated = true;
              $rootScope.$broadcast('app:servicerequests:reload');

              response = response || {};

              response.message = response.message || 'Issue Marked As Approved';

              $rootScope.$broadcast('appSuccess', response);
            });
          }
        })
        .catch(function() {});
    };

    /**
     * close and resolve issue
     */
    $scope.onResolve = function() {
      prompt({
        title: 'Resolve Issue',
        message: 'Are you sure you want to mark this issue as resolved?',
        buttons: [
          {
            label: 'Yes',
            primary: true,
          },
          {
            label: 'No',
            cancel: true,
          },
        ],
      })
        .then(function() {
          if (!$scope.servicerequest.resolvedAt) {
            var changelog = {
              //TODO flag internal or public
              changer: party._id,
              resolvedAt: new Date(),
            };

            //update changelog
            var _id = $scope.servicerequest._id;
            ServiceRequest.changelog(_id, changelog).then(function(response) {
              // $scope.servicerequest = response;
              $scope.select(response);
              $scope.updated = true;
              $rootScope.$broadcast('app:servicerequests:reload');

              response = response || {};

              response.message = response.message || 'Issue Marked As Resolved';

              $rootScope.$broadcast('appSuccess', response);
            });
          }
        })
        .catch(function() {});
    };

    /**
     * re-open close issue
     */
    $scope.onReOpen = function() {
      prompt({
        title: 'Re-Open Issue',
        message: 'Are you sure you want to re-open this issue?',
        buttons: [
          {
            label: 'Yes',
            primary: true,
          },
          {
            label: 'No',
            cancel: true,
          },
        ],
      })
        .then(function() {
          if ($scope.servicerequest.resolvedAt) {
            var changelog = {
              //TODO flag internal or public
              changer: party._id,
              resolvedAt: null,
            };

            //update changelog
            var _id = $scope.servicerequest._id;
            ServiceRequest.changelog(_id, changelog).then(function(response) {
              // $scope.servicerequest = response;
              $scope.select(response);
              $scope.updated = true;
              $rootScope.$broadcast('app:servicerequests:reload');

              response = response || {};

              response.message =
                response.message || 'Issue Re-Open Successfully';

              $rootScope.$broadcast('appSuccess', response);
            });
          }
        })
        .catch(function() {});
    };

    /**
     * Initialize new issue creation with reporter details
     */
    $scope.onCopy = function() {
      $state.go('app.create_servicerequests', {
        reporter: $scope.servicerequest.reporter,
        jurisdiction: $scope.servicerequest.jurisdiction,
      });
    };

    /**
     * Initialize new issue attending with operator details
     */
    $scope.onAttend = function() {
      //prevent attachments and changelogs on attending
      var servicerequest = _.omit($scope.servicerequest, [
        'attachments',
        'changelogs',
      ]);
      $state.go('app.create_servicerequests', servicerequest);
    };

    /**
     * @description delete servicerequest
     */
    $scope.delete = function(servicerequest) {
      servicerequest
        .$delete()
        .then(function(response) {
          response = response || {};

          response.message = response.message || 'Issue Deleted Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('servicerequest:delete:success', response);

          $rootScope.$broadcast('app:servicerequests:reload');
        })
        .catch(function(error) {
          if (error) {
            $rootScope.$broadcast('appError', error);
            $rootScope.$broadcast('servicerequest:delete:error', error);
          }
        });
    };

    /**
     * search servicerequests
     * @return {[type]} [description]
     */
    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * filter issue by provided reporter details
     * @param  {[type]} query [description]
     * @return {[type]}       [description]
     */
    $scope.filterByReporter = function(q, query) {
      $scope.search.q = q;
      $scope.load(query, true);
    };

    /**
     * search assignees
     * @return {[type]} [description]
     */
    $scope.onSearchAssignees = function() {
      //TODO allow party where jurisdiction = null
      if ($scope.search.party && $scope.search.party.length >= 2) {
        Party.find({
          filter: {
            deletedAt: {
              $eq: null,
            },
          },
          q: $scope.search.party,
        })
          .then(function(response) {
            $scope.assignees = response.parties;
          })
          .catch(function(/*error*/) {
            $scope.assignees = [];
          });
      }
    };

    $scope.load = function(query, skipClearSearch) {
      if (!skipClearSearch) {
        $scope.search = {};
        $scope.q = undefined;
      }
      $scope.find(query);
    };

    $scope.loadComment = function(servicerequest) {
      var changelogs = [].concat(servicerequest.changelogs);
      var comments = _.orderBy(changelogs, 'createdAt', 'desc');
      comments = _.map(comments, function(comment) {
        comment.color = undefined;
        comment.color = comment.status ? comment.status.color : comment.color;
        comment.color = comment.priority
          ? comment.priority.color
          : comment.color;
        comment.color = comment.reopenedAt ? '#F44336' : comment.color;
        comment.color = comment.resolvedAt ? '#4CAF50' : comment.color;
        comment.color = comment.attendedAt ? '#F9A825' : comment.color;
        comment.color = comment.completedAt ? '#0D47A3' : comment.color;
        comment.color = comment.verifiedAt ? '#EF6C01' : comment.color;
        comment.color = comment.approvedAt ? '#1B5E1F' : comment.color;
        if (comment.item) {
          comment.item = _.merge({}, comment.item, {
            properties: { unit: 'PCS' }, // TODO: fix unit not found
          });
        }
        if (comment.image) {
          if (!_.startsWith(comment.image.stream, 'http')) {
            comment.image.stream = Utils.asLink(['v1', comment.image.stream]);
          }
        }

        if (comment.document) {
          if (!_.startsWith(comment.document.download, 'http')) {
            comment.document.download = Utils.asLink([
              'v1',
              comment.document.download,
            ]);
          }
        }
        return comment;
      });
      $scope.comments = comments;
    };

    /**
     * @description prepare worklog of specified service request
     */
    $scope.loadWorkLog = function(servicerequest) {
      // filter only with item
      var changelogs = [].concat(servicerequest.changelogs);
      var worklogs = _.filter(changelogs, function(changelog) {
        return !_.isEmpty(changelog.item);
      });

      // sort by latest dates
      worklogs = _.orderBy(worklogs, 'createdAt', 'desc');

      // ensure unit
      worklogs = _.map(worklogs, function(worklog) {
        worklog = _.merge({}, worklog, {
          item: { properties: { unit: 'PCS' } }, // TODO: fix unit not found
        });
        return worklog;
      });

      // return work logs
      $scope.worklogs = worklogs;
    };

    /**
     * @description prepare images of specified service request
     */
    $scope.loadImages = function(servicerequest) {
      // filter only with image
      var changelogs = [].concat(servicerequest.changelogs);
      var worklogs = _.filter(changelogs, function(changelog) {
        return !_.isEmpty(changelog.image);
      });

      // sort by latest dates
      worklogs = _.orderBy(worklogs, 'createdAt', 'desc');

      // map to images
      var images = _.compact(_.map(worklogs, 'image'));

      // merge original service request image
      images = _.uniqBy([].concat(servicerequest.image).concat(images), '_id');
      images = _.compact(images);

      // format for gallery view
      images = _.map(images, function(image) {
        var thumb = image.stream;
        if (!_.startsWith(image.stream, 'http')) {
          thumb = Utils.asLink(['v1', image.stream]);
        }
        return {
          thumb: thumb,
          description: image.filename,
        };
      });

      // compact images
      images = _.compact(images);

      // update gallery attachments
      return ($scope.images = images);
    };

    /**
     * @description prepare documents of specified service request
     */
    $scope.loadDocuments = function(servicerequest) {
      // filter only with document
      var changelogs = [].concat(servicerequest.changelogs);
      var worklogs = _.filter(changelogs, function(changelog) {
        return !_.isEmpty(changelog.document);
      });

      // sort by latest dates
      worklogs = _.orderBy(worklogs, 'createdAt', 'desc');

      // map to documents
      var documents = _.compact(_.map(worklogs, 'document'));

      // merge original service request document
      documents = _.uniqBy(
        [].concat(servicerequest.document).concat(documents),
        '_id'
      );
      documents = _.compact(documents);

      // format for gallery view
      documents = _.map(documents, function(doc) {
        doc.type = _.toUpper(_.last(_.split(doc.filename, '.')));
        // doc.size = doc.length * 0.001;
        if (!_.startsWith(doc.stream, 'http')) {
          doc.stream = Utils.asLink(['v1', doc.stream]);
        }
        if (!_.startsWith(doc.download, 'http')) {
          doc.download = Utils.asLink(['v1', doc.download]);
        }
        return doc;
      });

      // compact documents
      documents = _.compact(documents);

      // update gallery attachments
      $scope.documents = documents;
    };

    /**
     * Load all service request based on current filters
     * @return {[type]} [description]
     */
    $scope.all = function() {
      $scope.page = 1;
      $scope.limit = $scope.total;
      $scope.find();
    };

    /**
     * @description load servicerequests
     */
    $scope.find = function(query) {
      //ensure query
      var isSearchable = $scope.search.q && $scope.search.q.length >= 2;
      var extras = isSearchable ? $scope.query : {};
      query = _.merge({}, { misc: $scope.misc }, extras, query);

      //ensure operator _id
      if (query.operator) {
        query.operator = _.get(query, 'operator._id', query.operator);
      }

      //start sho spinner
      $scope.spin = true;

      //activate all filter
      $scope.misc = query.misc;
      delete query.misc;

      //reset pagination
      if (query && query.resetPage) {
        $scope.page = 1;
        $scope.limit = 10;
        delete query.resetPage;
      }

      //track active ui based on query
      if (query.reset) {
        delete query.reset;

        $scope.query = query;
      } else {
        $scope.query = _.merge({}, $scope.query, query);
      }

      // rebind search
      if (isSearchable) {
        $scope.q = $scope.search.q;
      }

      ServiceRequest.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          updatedAt: -1,
        },
        filter: $scope.query,
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with servicerequests when done loading
          $scope.servicerequests = response.servicerequests;
          if ($scope.updated) {
            $scope.updated = false;
          } else {
            $scope.select(_.first($scope.servicerequests));
          }
          $scope.total = response.total;
          $scope.spin = false;
        })
        .catch(function(error) {
          $scope.spin = false;
        });
    };

    //check whether servicerequests will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.servicerequests && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //export current filtered issues
    $scope.export = function() {
      var _exports = _.map($scope.servicerequests, function(servicerequest) {
        return {
          code: servicerequest.code,
          reportedAt: servicerequest.createdAt,
          callStart: (servicerequest.call || {}).startedAt,
          callEnd: (servicerequest.call || {}).endedAt,
          callDurationMinutes: ((servicerequest.call || {}).duration || {})
            .minutes,
          callDurationSeconds: ((servicerequest.call || {}).duration || {})
            .seconds,
          reporterName: (servicerequest.reporter || {}).name,
          reporterPhone: (servicerequest.reporter || {}).phone,
          reporterAccount: (servicerequest.reporter || {}).account,
          operator: (servicerequest.operator || {}).name,
          area: (servicerequest.jurisdiction || {}).name,
          group: (servicerequest.group || {}).name,
          service: (servicerequest.service || {}).name,
          assignee: (servicerequest.assignee || {}).name,
          description: servicerequest.description,
          address: servicerequest.address,
          status: (servicerequest.status || {}).name,
          priority: (servicerequest.priority || {}).name,
          resolvedAt: servicerequest.resolvedAt,
          ttrDays: (servicerequest.ttr || {}).days,
          ttrHours: (servicerequest.ttr || {}).hours,
          ttrMinutes: (servicerequest.ttr || {}).minutes,
          ttrSeconds: (servicerequest.ttr || {}).seconds,
        };
      });
      return _exports;
    };

    $scope.isEmpty = function(value) {
      return _.isEmpty(value);
    };

    /**
     * @function
     * @name showResolvedAtFilter
     * @description Open modal window to show resolved at date filter
     */
    $scope.showResolvedAtFilter = function() {
      $scope.modal = $uibModal.open({
        templateUrl: 'views/servicerequests/_partials/resolve_time_filter.html',
        scope: $scope,
        size: 'lg',
      });

      $scope.modal.result.then(
        function onClose() {},
        function onDismissed() {}
      );
    };

    /**
     * @function
     * @name showReportedAtFilter
     * @description Open modal window to show reported at date filter
     */
    $scope.showReportedAtFilter = function() {
      $scope.modal = $uibModal.open({
        templateUrl:
          'views/servicerequests/_partials/reported_time_filter.html',
        scope: $scope,
        size: 'lg',
      });

      $scope.modal.result.then(
        function onClose() {},
        function onDismissed() {}
      );
    };

    /**
     * @function
     * @name showOperatorFilter
     * @description Open modal window for selecting operator for filtering
     * workspace
     */
    $scope.showOperatorFilter = function() {
      $scope.isOperatorFilter = true;
      $scope.modal = $uibModal.open({
        templateUrl: 'views/servicerequests/_partials/operator_filter.html',
        scope: $scope,
        size: 'lg',
      });

      $scope.modal.result.then(
        function onClose() {},
        function onDismissed() {}
      );
    };

    /**
     * @function
     * @name showAssigneeFilter
     * @description Open modal window for selecting assignee for filtering
     * workspace
     */
    $scope.showAssigneeFilter = function() {
      $scope.isOperatorFilter = false;
      $scope.modal = $uibModal.open({
        templateUrl: 'views/servicerequests/_partials/operator_filter.html',
        scope: $scope,
        size: 'lg',
      });

      $scope.modal.result.then(
        function onClose() {},
        function onDismissed() {}
      );
    };

    /**
     * @function
     * @name showAssigneeFilter
     * @description Open modal window for selecting assignee for filtering
     * workspace
     */
    $scope.showAssigneeModal = function() {
      if (!$scope.servicerequest.resolvedAt) {
        $scope.modal = $uibModal.open({
          templateUrl: 'views/servicerequests/_partials/assignee_modal.html',
          scope: $scope,
          size: 'lg',
        });

        $scope.modal.result.then(
          function onClose() {},
          function onDismissed() {}
        );
      }
    };

    /**
     * @function
     * @name filterByWorker
     * @description Filter Workspace service request by worker either
     * assignee or operator
     */
    $scope.filterByWorker = function(party) {
      if ($scope.isOperatorFilter) {
        $scope.operator = party;
      } else {
        $scope.assignee = party;
      }

      $scope.modal.close();
      // reset flag back to it's initial value
      $scope.isOperatorFilter = true;
    };

    /**
     * @description Present worklog modal
     */
    $scope.showWorklogModal = function() {
      //open worklog modal
      $scope.modal = $uibModal.open({
        templateUrl: 'views/servicerequests/_partials/worklog_modal.html',
        scope: $scope,
        size: 'lg',
      });

      //handle modal close and dismissed
      $scope.modal.result.then(
        function onClose(/*selectedItem*/) {},
        function onDismissed() {}
      );
    };

    $scope.onWorklog = function() {
      //ensure service request
      if ($scope.servicerequest && !$scope.servicerequest.resolvedAt) {
        var changelog = {
          item: $scope.worklog.item,
          quantity: $scope.worklog.quantity,
          comment: $scope.worklog.comment,
        };

        //update changelog
        if (changelog.item && changelog.quantity > 0) {
          var _id = $scope.servicerequest._id;
          ServiceRequest.changelog(_id, changelog).then(function(response) {
            $scope.modal.close();
            // $scope.servicerequest = response;
            $scope.select(response);
            $scope.updated = true;
            $rootScope.$broadcast('app:servicerequests:reload');
          });
        } else {
          $scope.modal.close();
        }
      }
    };

    /**
     * @function
     * @name onRefresh
     * @description Refresh selected service request
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.onRefresh = function() {
      if ($scope.servicerequest) {
        $scope.servicerequest.$get().then(function(response) {
          $scope.servicerequest = new ServiceRequest(response);
          $scope.select($scope.servicerequest);
        });
      }
    };

    //pre load un resolved servicerequests on state activation
    $scope.find({
      $or: [{ operator: party._id }, { assignee: party._id }],
      resolvedAt: { $eq: null },
      resetPage: true,
      reset: true,
      misc: 'inbox',
    });

    //listen for events
    $rootScope.$on('app:servicerequests:reload', function() {
      //re-load current operator service requests(inbox)
      $scope.find({
        $or: [{ operator: party._id }, { assignee: party._id }],
        resolvedAt: { $eq: null },
        resetPage: true,
        reset: true,
        misc: 'inbox',
      });
    });

    //reload summaries
    $rootScope.$on('app:servicerequests:reload', function() {
      //TODO pass params based on filter
      Summary.issues().then(function(summaries) {
        $scope.summaries = summaries;
      });
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ServiceRequestShowCtrl
 * @description
 * # ServiceRequestShowCtrl
 * ServiceRequest show controller of ng311
 */
angular
  .module('ng311')
  .controller('ServiceRequestShowCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    ServiceRequest,
    $timeout
  ) {
    $scope.edit = false;
    $scope.roles = roles.roles;

    $scope.onEdit = function() {
      $scope.edit = true;
    };

    //load party
    $scope.party = ServiceRequest.get({
      id: $stateParams.id,
    });

    /**
     * @description block created party
     */
    $scope.block = function() {
      //TODO show input prompt
      //TODO show loading mask
      $scope.party.deletedAt = new Date();
      $scope.save();
    };

    /**
     * @description unblock created party
     */
    $scope.unblock = function() {
      //TODO show input prompt
      //TODO show loading mask
      $scope.party.deletedAt = null;
      $scope.save();
    };

    /**
     * @description save created party
     */
    $scope.save = function() {
      //TODO show input prompt
      //TODO show loading mask
      $scope.party.roles = $scope.party._assigned;

      $scope.party
        .$update()
        .then(function(response) {
          response = response || {};

          response.message = response.message || 'User updated successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('servicerequest:update:success', response);
          $rootScope.$broadcast('app:servicerequests:reload');

          $state.go('app.servicerequests.list');
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
          $rootScope.$broadcast('servicerequest:update:error', error);
        });
    };
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:ServiceRequest
 * @description
 * ServiceRequest states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //servicerequests management states
  $stateProvider
    .state('app.servicerequests', {
      // abstract: true,
      templateUrl: 'views/servicerequests/main.html',
      controller: 'ServiceRequestMainCtrl',
      resolve: {
        endpoints: function(Summary) {
          return Summary.endpoints({
            filter: {
              deletedAt: {
                $eq: null,
              },
            },
          });
        },
        items: function(Item) {
          return Item.find({
            limit: 1000,
            filter: {
              deletedAt: {
                $eq: null,
              },
            },
          });
        },
      },
    })
    .state('app.servicerequests.list', {
      url: '/servicerequests',
      templateUrl: 'views/servicerequests/index.html',
      controller: 'ServiceRequestIndexCtrl',
      data: {
        authenticated: true,
      },
    })
    .state('app.servicerequests.show', {
      url: '/servicerequests/show/:id',
      templateUrl: 'views/servicerequests/create.html',
      controller: 'ServiceRequestShowCtrl',
      data: {
        authenticated: true,
      },
    })
    .state('app.create_servicerequests', {
      url: '/servicerequests/create',
      params: {
        //hack to allow state go with reporter $state param
        reporter: undefined,
        jurisdiction: undefined,
        service: undefined,
        description: undefined,
        address: undefined,
        method: {},
        _id: undefined,
        servicerequest: undefined,
      },
      templateUrl: 'views/servicerequests/create.html',
      controller: 'ServiceRequestCreateCtrl',
      data: {
        authenticated: true,
      },
      resolve: {
        endpoints: function(Summary) {
          return Summary.endpoints({
            filter: {
              deletedAt: {
                $eq: null,
              },
            },
          });
        },
      },
    });
});

'use strict';

/**
 * @ngdoc Alert
 * @name ng311.Alert
 */
angular.module('ng311').factory('Alert', function($resource, $http, Utils) {
  // account accessors resource

  var Alert = $resource(
    Utils.asLink(['v1', 'alerts']),
    {
      id: '@_id',
    },
    {
      update: {
        method: 'PUT',
      },
    }
  );

  /**
   * Find alerts with pagination
   *
   * @function
   * @name find
   *
   * @param {Object} params
   * @returns {Object}
   *
   * @version 0.1.0
   * @since 0.1.0
   */
  Alert.find = function(params) {
    return $http
      .get(Utils.asLink(['v1', 'alerts']), { params: params })
      .then(function(response) {
        var alerts = response.data.data.map(function(alert) {
          return new Alert(alert);
        });

        return {
          alerts: alerts,
          total: response.data.total,
        };
      });
  };

  return Alert;
});

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller.AlertMainCtrl
 * @description
 * Alert Main Controller
 */
angular
  .module('ng311')
  .controller('AlertMainCtrl', function(
    $rootScope,
    $scope,
    $uibModal,
    endpoints,
    Alert
  ) {
    $scope.page = 1;
    $scope.limit = 10;
    $scope.search = {};
    $scope.channels = [];
    $scope._alert = { jurisdictions: [], methods: [], receivers: [] };
    $scope.alert = $scope._alert;

    $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;
    $scope.methods = [
      { name: 'SMS' },
      { name: 'Email' },
      { name: 'Push Notification' },
    ];

    $scope.priorities = [
      { name: 'High', count: 100 },
      { name: 'Normal', count: 100 },
      { name: 'Low', count: 100 },
    ];

    $scope.statuses = [
      { name: 'Sent', count: 100 },
      { name: 'Failed', count: 100 },
      { name: 'Delivered', count: 100 },
    ];

    $scope.methods = [
      { name: 'SMS', count: 100 },
      { name: 'Email', count: 100 },
      { name: 'Push Notification', count: 100 },
    ];

    $scope.receivers = [
      { name: 'Reporters' },
      { name: 'Customers' },
      { name: 'Subscribers' },
      { name: 'Employees' },
    ];

    /**
     * Open model to compose
     *
     * @function
     * @name compose
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.compose = function() {
      //open performance reports filter modal
      $scope.modal = $uibModal.open({
        templateUrl: 'views/alerts/_partials/compose.html',
        scope: $scope,
        size: 'lg',
      });

      //handle modal close and dismissed
      $scope.modal.result.then(
        function onClose(/*selectedItem*/) {},
        function onDismissed() {}
      );
    };

    /**
     * Send composed message
     *
     * @function
     * @name send
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.send = function() {
      // TODO support Email and Push notification
      // normalize input
      // $scope.alert.methods = $scope.channels.map(function(method) {
      //   return method.toUpperCase();
      // });
      $scope.alert.methods = ['SMS']; // fix SMS as the type of alert that will be sent

      var alert = new Alert($scope.alert);

      // save an alert
      alert
        .$save()
        .then(function(/*response*/) {
          //reset alert & dismiss modal
          $scope.alert = $scope._alert;
          $scope.modal.dismiss();

          //TODO avoid collision with alert.message
          var response = {};

          response.message = response.message || 'Alert Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:alerts:reload');
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
        });
    };

    /**
     * Load initial alerts on state activation
     *
     * @function
     * @name index
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.find = function() {
      Alert.find({
        sort: {
          createdAt: -1,
        },
        page: $scope.page,
        q: $scope.q,
      }).then(function(results) {
        $scope.alerts = results.alerts.map(function(alert) {
          var areas = _.map([].concat(alert.jurisdictions), function(
            jurisdiction
          ) {
            return jurisdiction.name;
          });

          return _.merge({}, alert, { areas: areas.toString() });
        });
        $scope.total = results.total;
      });
    };

    /**
     * Search Alert
     *
     * @function
     * @name onSearch
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.onSearch = function() {
      if ($scope.alerts && $scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * Determine whether to show pagination button
     *
     * @function
     * @name willPaginate
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.willPaginate = function() {
      return $scope.total && $scope.total > $scope.limit;
    };

    // load alerts
    $scope.find();

    //listen for events
    $rootScope.$on('app:alerts:reload', function() {
      $scope.alert = $scope._alert;
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Alert
 * @description Alert workflows configurations
 */
angular.module('ng311').config(function($stateProvider) {
  $stateProvider.state('app.alerts', {
    url: '/alerts',
    templateUrl: 'views/alerts/main.html',
    controller: 'AlertMainCtrl',
    resolve: {
      endpoints: function(Summary) {
        return Summary.endpoints({
          filter: {
            deletedAt: {
              $eq: null,
            },
          },
        });
      },
    },
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc account
 * @name ng311.Account
 */
angular.module('ng311').factory('Account', function($http, $resource, Utils) {
  // account accessors resource
  var Account = $resource(
    Utils.asLink(['v1', 'accounts']),
    {
      id: '@_id',
    },
    {
      update: {
        method: 'PUT',
      },
    }
  );

  /**
   * Normalize accessor object by adding verified field
   *
   * @function
   * @name normalizeAccessors
   *
   * @param {Array} accessors
   * @returns {Object} normalized accessors list
   *
   * @version 0.1.0
   * @since 0.1.0
   */
  function normalizeAccessors(accessors) {
    return _.map(accessors, function(accessor) {
      if (accessor.verifiedAt) {
        return _.merge({}, accessor, { verified: true });
      }

      return _.merge({}, accessor, { verified: false });
    });
  }

  /**
   * Normalize bill items structure
   *
   * @function
   * @name normalizeBillItems
   *
   * @param {Object[]} items
   * @returns {Object} normalized bill items
   *
   * @version 0.1.0
   * @since 0.1.0
   */
  function normalizeBillItems(items) {
    return _.map(items, function(item) {
      var defaultItem = { name: '', quantity: '', unit: '', price: 0 };
      return _.merge({}, defaultItem, item);
    });
  }

  /**
   * Retrieve account details
   *
   * @param {String} accountNumber Account Number
   * @returns {Promise} Resolves to customer Account Object
   *
   * @version 0.1.0
   * @since 0.1.0
   */
  Account.getDetails = function(accountNumber) {
    return $http
      .get(Utils.asLink(['v1', 'accounts']), {
        params: {
          filter: {
            number: accountNumber,
          },
        },
      })
      .then(function(response) {
        var customerAccount = _.first(response.data.data);

        customerAccount.accessors = normalizeAccessors(
          customerAccount.accessors
        );

        customerAccount.bills = _.map(customerAccount.bills, function(bill) {
          bill.items = normalizeBillItems(bill.items);
          return bill;
        });

        // create full address field
        customerAccount.fullAddress =
          customerAccount.neighborhood + ' - ' + customerAccount.address;

        customerAccount.outstandingBalance =
          _.first(customerAccount.bills).balance.outstand || 0;

        return customerAccount;
      })
      .catch(function(/*error*/) {
        //TODO handle error
      });
  };

  /**
   * Add new accessor to the account
   *
   * @param {ObjectId} id account unique identifier
   * @param {Object} accessor new accessor to be added
   * @returns {Promise} Resolves to accessors list
   *
   * @version 0.1.0
   * @since 0.1.0
   */
  Account.addAccessor = function(id, accessor) {
    var url = Utils.asLink(['v1', 'accounts', id, 'accessors']);
    return $http.post(url, accessor).then(function(response) {
      response.data.accessors = normalizeAccessors(response.data.accessors);
      return response.data;
    });
  };

  /**
   * Verify account accessor by adding verifiedAt timestamp
   *
   * @param {ObjectId} id account unique identifier
   * @param {String} phoneNumber
   * @returns {Promise} Resolves to accessors list
   *
   * @version 0.1.0
   * @since 0.1.0
   */
  Account.verifyAccessor = function(id, phoneNumber) {
    var url = Utils.asLink(['v1', 'accounts', id, 'accessors', phoneNumber]);
    return $http.put(url, { verifiedAt: new Date() }).then(function(response) {
      response.data.accessors = normalizeAccessors(response.data.accessors);

      return response.data;
    });
  };

  /**
   * Update account accessor details
   *
   * @param {ObjectId} id account unique identifier
   * @param {String} phoneNumber
   * @param {Object} updates
   * @returns {Promise} Resolves to accessors list
   *
   * @version 0.1.0
   * @since 0.1.0
   */
  Account.updateAccessor = function(id, phoneNumber, updates) {
    var url = Utils.asLink(['v1', 'accounts', id, 'accessors', phoneNumber]);

    return $http.put(url, updates).then(function(response) {
      response.data.accessors = normalizeAccessors(response.data.accessors);

      return response.data;
    });
  };

  /**
   * Delete  account accessor
   *
   * @param {ObjectId} id account unique identifier
   * @param {String} phoneNumber
   * @param {Object} updates
   * @returns {Promise} Resolves to accessors list
   *
   * @version 0.1.0
   * @since 0.1.0
   */
  Account.deleteAccessor = function(id, phoneNumber) {
    var url = Utils.asLink(['v1', 'accounts', id, 'accessors', phoneNumber]);

    return $http.delete(url).then(function(response) {
      response.data.accessors = normalizeAccessors(response.data.accessors);

      return response.data;
    });
  };

  return Account;
});

'use strict';

angular
  .module('ng311')
  .controller('AccountIndexCtrl', function($rootScope, $scope) {
    $scope.account = $rootScope.account;
  });

'use strict';

angular
  .module('ng311')
  .controller('AccountAccessorsIndexCtrl', function(
    $rootScope,
    $scope,
    $state,
    Account
  ) {
    /* declaration */
    $scope.accessors = $rootScope.account.accessors;
    var account = $rootScope.account;

    /**
     * Open Account details view
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.openAccountDetails = function() {
      $state.go('account.details');
    };

    /**
     * Open a form for creating account accessor
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.addAccessor = function() {
      $state.go('account.create');
    };

    /**
     * Open a form for editing account accessor
     * @param {Object} accessor
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.editAccessor = function(accessor) {
      $state.go('account.create', { accessor: accessor });
    };

    /**
     * Verify account accessor
     * @param {String} phoneNumber
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.verifyAccessor = function(phoneNumber) {
      Account.verifyAccessor(account._id, phoneNumber).then(function(account) {
        $rootScope.account = account;
        $scope.accessors = account.accessors;
      });
    };

    /**
     * Remove account accessor
     * @param {String} phoneNumber
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.removeAccessor = function(phoneNumber) {
      Account.deleteAccessor(account._id, phoneNumber).then(function(account) {
        $rootScope.account = account;
        $scope.accessors = account.accessors;
      });
    };
  });

'use strict';

angular
  .module('ng311')
  .controller('AccountAccessorsCreateCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    Account
  ) {
    var isEdit = $stateParams.accessor || false;
    $scope.accessor = $stateParams.accessor || {};
    $scope.title = $stateParams.accessor ? 'Edit' : 'New';

    /**
     * Navigate back to accessor list
     * @function
     * @name openAccessorList
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.openAccessorList = function() {
      $state.go('account.accessors');
    };

    /**
     * Create a new accessor in account
     * @function
     * @name addAccessor
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.addAccessor = function() {
      var account = $rootScope.account;

      if (isEdit) {
        Account.updateAccessor(
          account._id,
          $scope.accessor.phone,
          $scope.accessor
        )
          .then(function(account) {
            $rootScope.account = account;
            $scope.openAccessorList();
          })
          .catch(function(/*error*/) {
            // Handle error here
          });
      } else {
        Account.addAccessor(account._id, $scope.accessor)
          .then(function(account) {
            $rootScope.account = account;
            $scope.openAccessorList();
          })
          .catch(function(/*error*/) {});
      }
    };
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Account
 * @description billing workflows configurations
 */
angular.module('ng311').config(function($stateProvider) {
  $stateProvider
    .state('account', {
      abstract: true,
      parent: 'app.create_servicerequests',
      url: '',
      onEnter: [
        '$uibModal',
        '$state',
        function($uibModal, $state) {
          $uibModal
            .open({
              animation: true,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: 'views/account/index.html',
              size: 'lg',
            })
            .result.finally(function() {
              $state.go('app.create_servicerequests');
            });
        },
      ],
    })
    .state('account.details', {
      views: {
        'account@': {
          templateUrl: 'views/account/_partials/account_details.html',
          controller: 'AccountIndexCtrl',
        },
      },
    })
    .state('account.accessors', {
      views: {
        'account@': {
          templateUrl: 'views/account/_partials/accessors_list.html',
          controller: 'AccountAccessorsIndexCtrl',
        },
      },
    })
    .state('account.create', {
      params: {
        accessor: null,
      },
      views: {
        'account@': {
          templateUrl: 'views/account/_partials/create.html',
          controller: 'AccountAccessorsCreateCtrl',
        },
      },
    });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.ServiceGroup
 * @description
 * # ServiceGroup
 * Factory in the ng311.
 */
angular
  .module('ng311')
  .factory('ServiceGroup', function($http, $resource, Utils) {
    //create servicegroup resource
    var ServiceGroup = $resource(
      Utils.asLink(['v1', 'servicegroups', ':id']),
      {
        id: '@_id',
      },
      {
        update: {
          method: 'PUT',
        },
      }
    );

    /**
     * @description find servicegroup with pagination
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    ServiceGroup.find = function(params) {
      return $http
        .get(Utils.asLink(['v1', 'servicegroups']), {
          params: params,
        })
        .then(function(response) {
          //map plain servicegroup object to resource instances
          var servicegroups = response.data.data.map(function(servicegroup) {
            //create servicegroup as a resource instance
            return new ServiceGroup(servicegroup);
          });

          //return paginated response
          return {
            servicegroups: servicegroups,
            total: response.data.total,
          };
        });
    };

    return ServiceGroup;
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ServiceGroupIndexCtrl
 * @description
 * # ServiceGroupIndexCtrl
 * ServiceGroup list controller of ng311
 */
angular
  .module('ng311')
  .controller('ServiceGroupIndexCtrl', function(
    $rootScope,
    $scope,
    $state,
    ServiceGroup
  ) {
    //groups in the scope
    $scope.spin = false;
    $scope.servicegroups = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * set current service request
     */
    $scope.select = function(servicegroup) {
      //sort comments in desc order
      if (servicegroup && servicegroup._id) {
        //update scope service request ref
        $scope.servicegroup = servicegroup;
        $rootScope.$broadcast('servicegroup:selected', servicegroup);
      }

      $scope.create = false;
    };

    /**
     * @description load groups
     */
    $scope.find = function() {
      //start sho spinner
      $scope.spin = true;

      ServiceGroup.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1,
        },
        filter: {},
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with groups when done loading
          $scope.servicegroups = response.servicegroups;
          if ($scope.updated) {
            $scope.updated = false;
          } else {
            $scope.select(_.first($scope.servicegroups));
          }
          $scope.total = response.total;
          $scope.spin = false;
        })
        .catch(function(error) {
          $scope.spin = false;
        });
    };

    //check whether groups will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.servicegroups && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //pre load groups on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:servicegroups:reload', function() {
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ServiceGroupShowCtrl
 * @description
 * # ServiceGroupShowCtrl
 * ServiceGroup show controller of ng311
 */
angular
  .module('ng311')
  .controller('ServiceGroupShowCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    ServiceGroup
  ) {
    $scope.edit = false;

    /**
     * @function
     * @name setColorPickerOptions
     * @description Set or Update color picker options when need to change
     *
     * @version  0.1.0
     * @since 0.1.0
     */
    var setColorPickerOptions = function() {
      $scope.colorPickerOptions = {
        swatchPos: 'right',
        disabled: !$scope.edit,
        inputClass: 'form-control',
        format: 'hexString',
        round: true,
      };
    };

    $scope.onEdit = function() {
      $scope.edit = true;
      setColorPickerOptions();
    };

    $scope.onCancel = function() {
      $scope.edit = false;
      setColorPickerOptions();
      $rootScope.$broadcast('app:servicegroups:reload');
    };

    $scope.onNew = function() {
      $scope.servicegroup = new ServiceGroup({});
      $scope.edit = true;
      setColorPickerOptions();
    };

    //TODO show empty state if no servicegroup selected
    //listen for selected servicegroup
    $rootScope.$on('servicegroup:selected', function(event, servicegroup) {
      $scope.servicegroup = servicegroup;
    });

    /**
     * @description save created servicegroup
     */
    $scope.save = function() {
      //TODO show input prompt
      //TODO show loading mask

      //try update or save servicegroup
      var updateOrSave = !$scope.servicegroup._id
        ? $scope.servicegroup.$save()
        : $scope.servicegroup.$update();

      updateOrSave
        .then(function(response) {
          response = response || {};

          response.message =
            response.message || 'Service Group Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:servicegroups:reload');

          $scope.edit = false;
          setColorPickerOptions();
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
        });
    };

    setColorPickerOptions();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:ServiceGroup
 * @description
 * ServiceGroup states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //servicegroups management states
  $stateProvider.state('app.manage.servicegroups', {
    url: '/servicegroups',
    views: {
      list: {
        templateUrl: 'views/servicegroups/_partials/list.html',
        controller: 'ServiceGroupIndexCtrl',
      },
      detail: {
        templateUrl: 'views/servicegroups/_partials/detail.html',
        controller: 'ServiceGroupShowCtrl',
      },
    },
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.ServiceType
 * @description
 * # ServiceType
 * Factory in the ng311.
 */
angular
  .module('ng311')
  .factory('ServiceType', function($http, $resource, Utils) {
    //create service type resource
    var ServiceType = $resource(
      Utils.asLink(['v1/predefines/servicetypes', ':id']),
      {
        id: '@_id',
      },
      {
        update: {
          method: 'PUT',
        },
      }
    );

    /**
     * @description find service type with pagination
     * @param  {Object} params query params
     * @return {Object}
     */
    ServiceType.find = function(params) {
      return $http
        .get(Utils.asLink('v1/predefines/servicetypes'), {
          params: params,
        })
        .then(function(response) {
          //map plain service object to resource instances
          var servicetypes = response.data.data.map(function(servicetype) {
            //create service type as a resource instance
            return new ServiceType(servicetype);
          });

          //return paginated response
          return {
            servicetypes: servicetypes,
            total: response.data.total,
          };
        });
    };

    return ServiceType;
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ServiceTypeIndexCtrl
 * @description
 * # ServiceTypeIndexCtrl
 * ServiceType list controller of ng311
 */
angular
  .module('ng311')
  .controller('ServiceTypeIndexCtrl', function(
    $rootScope,
    $scope,
    $state,
    ServiceType
  ) {
    //servicetypes in the scope
    $scope.spin = false;
    $scope.servicetypes = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * set current servicetype request
     */
    $scope.select = function(servicetype) {
      //sort comments in desc order
      if (servicetype && servicetype._id) {
        //update scope servicetype request ref
        $scope.servicetype = servicetype;
        $rootScope.$broadcast('servicetype:selected', servicetype);
      }

      $scope.create = false;
    };

    /**
     * @description load servicetypes
     */
    $scope.find = function() {
      //start sho spinner
      $scope.spin = true;

      ServiceType.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          'name.en': 1,
        },
        filter: {},
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with servicetypes when done loading
          $scope.servicetypes = response.servicetypes;
          if ($scope.updated) {
            $scope.updated = false;
          } else {
            $scope.select(_.first($scope.servicetypes));
          }
          $scope.total = response.total;
          $scope.spin = false;
        })
        .catch(function(error) {
          $scope.spin = false;
        });
    };

    //check whether servicetypes will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.servicetypes && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //pre load servicetypes on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:servicetypes:reload', function() {
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ServiceTypeShowCtrl
 * @description
 * # ServiceTypeShowCtrl
 * ServiceType show controller of ng311
 */
angular
  .module('ng311')
  .controller('ServiceTypeShowCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    ServiceType
  ) {
    $scope.edit = false;

    /**
     * @function
     * @name setColorPickerOptions
     * @description Set or Update color picker options when need to change
     *
     * @version  0.1.0
     * @since 0.1.0
     */
    var setColorPickerOptions = function() {
      $scope.colorPickerOptions = {
        swatchPos: 'right',
        disabled: !$scope.edit,
        inputClass: 'form-control',
        format: 'hexString',
        round: true,
      };
    };

    $scope.onEdit = function() {
      $scope.edit = true;
      setColorPickerOptions();
    };

    $scope.onCancel = function() {
      $scope.edit = false;
      setColorPickerOptions();
      $rootScope.$broadcast('app:servicetypes:reload');
    };

    $scope.onNew = function() {
      $scope.servicetype = new ServiceType({});
      $scope.edit = true;
      setColorPickerOptions();
    };

    //TODO show empty state if no servicetype selected
    //listen for selected servicetype
    $rootScope.$on('servicetype:selected', function(event, servicetype) {
      $scope.servicetype = servicetype;
    });

    /**
     * @description save created servicetype
     */
    $scope.save = function() {
      //TODO show input prompt
      //TODO show loading mask

      //try update or save servicetype
      var updateOrSave = !$scope.servicetype._id
        ? $scope.servicetype.$save()
        : $scope.servicetype.$update();

      updateOrSave
        .then(function(response) {
          response = response || {};

          response.message =
            response.message || 'Service Type Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:servicetypes:reload');

          $scope.edit = false;
          setColorPickerOptions();
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
        });
    };

    setColorPickerOptions();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:ServiceType
 * @description
 * ServiceType states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //servicetypes management states
  $stateProvider.state('app.manage.servicetypes', {
    url: '/servicetypes',
    views: {
      list: {
        templateUrl: 'views/servicetypes/_partials/list.html',
        controller: 'ServiceTypeIndexCtrl',
      },
      detail: {
        templateUrl: 'views/servicetypes/_partials/detail.html',
        controller: 'ServiceTypeShowCtrl',
      },
    },
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Service
 * @description
 * # Service
 * Factory in the ng311.
 */
angular.module('ng311').factory('Service', function($http, $resource, Utils) {
  //create service resource
  var Service = $resource(
    Utils.asLink(['v1', 'services', ':id']),
    {
      id: '@_id',
    },
    {
      update: {
        method: 'PUT',
      },
    }
  );

  /**
   * @description find service with pagination
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Service.find = function(params) {
    //ensure service group is populated
    params = _.merge({}, params, {
      populate: [{ path: 'group', select: 'name' }],
    });

    return $http
      .get(Utils.asLink(['v1', 'services']), {
        params: params,
      })
      .then(function(response) {
        //map plain service object to resource instances
        var services = response.data.data.map(function(service) {
          //create service as a resource instance
          return new Service(service);
        });

        //return paginated response
        return {
          services: services,
          total: response.data.total,
        };
      });
  };

  return Service;
});

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ServiceIndexCtrl
 * @description
 * # ServiceIndexCtrl
 * Service list controller of ng311
 */
angular
  .module('ng311')
  .controller('ServiceIndexCtrl', function(
    $rootScope,
    $scope,
    $state,
    Service
  ) {
    //services in the scope
    $scope.spin = false;
    $scope.services = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * set current service request
     */
    $scope.select = function(service) {
      //sort comments in desc order
      if (service && service._id) {
        //update scope service request ref
        $scope.service = service;
        $rootScope.$broadcast('service:selected', service);
      }

      $scope.create = false;
    };

    /**
     * @description load services
     */
    $scope.find = function() {
      //start sho spinner
      $scope.spin = true;

      Service.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1,
        },
        filter: {},
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with services when done loading
          $scope.services = response.services;
          if ($scope.updated) {
            $scope.updated = false;
          } else {
            $scope.select(_.first($scope.services));
          }
          $scope.total = response.total;
          $scope.spin = false;
        })
        .catch(function(error) {
          $scope.spin = false;
        });
    };

    //check whether services will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.services && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //pre load services on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:services:reload', function() {
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ServiceShowCtrl
 * @description
 * # ServiceShowCtrl
 * Service show controller of ng311
 */
angular
  .module('ng311')
  .controller('ServiceShowCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    Service,
    endpoints,
    ServiceGroup,
    Priority,
    ServiceType
  ) {
    $scope.edit = false;
    // $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;

    /**
     * @function
     * @name setColorPickerOptions
     * @description Set or Update color picker options when need to change
     *
     * @version  0.1.0
     * @since 0.1.0
     */
    var setColorPickerOptions = function() {
      $scope.colorPickerOptions = {
        swatchPos: 'right',
        disabled: !$scope.edit,
        inputClass: 'form-control',
        format: 'hexString',
        round: true,
      };
    };

    /**
     * @function
     * @name searchServiceGroup
     * @description Search service group by name
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.searchServiceGroups = function(query) {
      return ServiceGroup.find({ q: query }).then(function(response) {
        return response.servicegroups;
      });
    };

    /**
     * @function
     * @name searchPriorities
     * @description Search priorities by name
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.searchPriorities = function(query) {
      return Priority.find({ q: query }).then(function(response) {
        return response.priorities;
      });
    };

    /**
     * @function
     * @name searchServiceTypes
     * @description Search service types by name
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.searchServiceTypes = function(query) {
      return ServiceType.find({ q: query }).then(function(response) {
        return response.servicetypes;
      });
    };

    $scope.onEdit = function() {
      $scope.edit = true;
      setColorPickerOptions();
    };

    $scope.onCancel = function() {
      $scope.edit = false;
      setColorPickerOptions();
      $rootScope.$broadcast('app:services:reload');
    };

    $scope.onNew = function() {
      $scope.service = new Service({});
      $scope.edit = true;
      setColorPickerOptions();
    };

    //TODO show empty state if no service selected
    //listen for selected service
    $rootScope.$on('service:selected', function(event, service) {
      $scope.service = service;
    });

    /**
     * @description save created service
     */
    $scope.save = function() {
      //TODO show input prompt
      //TODO show loading mask

      //try update or save service
      var updateOrSave = !$scope.service._id
        ? $scope.service.$save()
        : $scope.service.$update();

      updateOrSave
        .then(function(response) {
          response = response || {};

          response.message = response.message || 'Service Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:services:reload');

          $scope.edit = false;
          setColorPickerOptions();
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
        });
    };

    setColorPickerOptions();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Service
 * @description
 * Service states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //services management states
  $stateProvider.state('app.manage.services', {
    url: '/services',
    views: {
      list: {
        templateUrl: 'views/services/_partials/list.html',
        controller: 'ServiceIndexCtrl',
      },
      detail: {
        templateUrl: 'views/services/_partials/detail.html',
        controller: 'ServiceShowCtrl',
        resolve: {
          endpoints: function(Summary) {
            return Summary.endpoints({
              filter: {
                deletedAt: {
                  $eq: null,
                },
              },
            });
          },
          servicetypes: function(ServiceType) {
            return ServiceType.find({
              limit: 1000,
              filter: {
                deletedAt: {
                  $eq: null,
                },
              },
            });
          },
        },
      },
    },
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Status
 * @description
 * # Status
 * Factory in the ng311.
 */
angular.module('ng311').factory('Status', function($http, $resource, Utils) {
  //create status resource
  var Status = $resource(
    Utils.asLink(['v1', 'statuses', ':id']),
    {
      id: '@_id',
    },
    {
      update: {
        method: 'PUT',
      },
    }
  );

  /**
   * @description find status with pagination
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Status.find = function(params) {
    return $http
      .get(Utils.asLink(['v1', 'statuses']), {
        params: params,
      })
      .then(function(response) {
        //map plain status object to resource instances
        var statuses = response.data.data.map(function(status) {
          //create status as a resource instance
          return new Status(status);
        });

        //return paginated response
        return {
          statuses: statuses,
          total: response.data.total,
        };
      });
  };

  return Status;
});

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:StatusIndexCtrl
 * @description
 * # StatusIndexCtrl
 * Status list controller of ng311
 */
angular
  .module('ng311')
  .controller('StatusIndexCtrl', function($rootScope, $scope, $state, Status) {
    //statuses in the scope
    $scope.spin = false;
    $scope.statuses = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * set current service request
     */
    $scope.select = function(status) {
      //sort comments in desc order
      if (status && status._id) {
        //update scope service request ref
        $scope.status = status;
        $rootScope.$broadcast('status:selected', status);
      }

      $scope.create = false;
    };

    /**
     * @description load statuses
     */
    $scope.find = function() {
      //start sho spinner
      $scope.spin = true;

      Status.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1,
        },
        filter: {},
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with statuses when done loading
          $scope.statuses = response.statuses;
          if ($scope.updated) {
            $scope.updated = false;
          } else {
            $scope.select(_.first($scope.statuses));
          }
          $scope.total = response.total;
          $scope.spin = false;
        })
        .catch(function(error) {
          $scope.spin = false;
        });
    };

    //check whether statuses will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.statuses && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //pre load statuses on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:statuses:reload', function() {
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:StatusShowCtrl
 * @description
 * # StatusShowCtrl
 * Status show controller of ng311
 */
angular
  .module('ng311')
  .controller('StatusShowCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    Status
  ) {
    $scope.edit = false;

    /**
     * @function
     * @name setColorPickerOptions
     * @description Set or Update color picker options when need to change
     *
     * @version  0.1.0
     * @since 0.1.0
     */
    var setColorPickerOptions = function() {
      $scope.colorPickerOptions = {
        swatchPos: 'right',
        disabled: !$scope.edit,
        inputClass: 'form-control',
        format: 'hexString',
        round: true,
      };
    };

    $scope.onEdit = function() {
      $scope.edit = true;
      setColorPickerOptions();
    };

    $scope.onCancel = function() {
      $scope.edit = false;
      setColorPickerOptions();
      $rootScope.$broadcast('app:statuses:reload');
    };

    $scope.onNew = function() {
      $scope.status = new Status({ weight: 0, color: '#FF9800' });
      $scope.edit = true;
      setColorPickerOptions();
    };

    //TODO show empty state if no status selected
    //listen for selected juridiction
    $rootScope.$on('status:selected', function(event, status) {
      $scope.status = status;
    });

    /**
     * @description save created status
     */
    $scope.save = function() {
      //TODO show input prompt
      //TODO show loading mask

      //try update or save status
      var updateOrSave = !$scope.status._id
        ? $scope.status.$save()
        : $scope.status.$update();

      updateOrSave
        .then(function(response) {
          response = response || {};

          response.message = response.message || 'Status Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:statuses:reload');

          $scope.edit = false;
          setColorPickerOptions();
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
        });
    };

    setColorPickerOptions();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Status
 * @description
 * Status states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //statuses management states
  $stateProvider.state('app.manage.statuses', {
    url: '/statuses',
    views: {
      list: {
        templateUrl: 'views/statuses/_partials/list.html',
        controller: 'StatusIndexCtrl',
      },
      detail: {
        templateUrl: 'views/statuses/_partials/detail.html',
        controller: 'StatusShowCtrl',
      },
    },
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Priority
 * @description
 * # Priority
 * Factory in the ng311.
 */
angular.module('ng311').factory('Priority', function($http, $resource, Utils) {
  //create priority resource
  var Priority = $resource(
    Utils.asLink(['v1', 'priorities', ':id']),
    {
      id: '@_id',
    },
    {
      update: {
        method: 'PUT',
      },
    }
  );

  /**
   * @description find priority with pagination
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Priority.find = function(params) {
    return $http
      .get(Utils.asLink(['v1', 'priorities']), {
        params: params,
      })
      .then(function(response) {
        //map plain priority object to resource instances
        var priorities = response.data.data.map(function(priority) {
          //create priority as a resource instance
          return new Priority(priority);
        });

        //return paginated response
        return {
          priorities: priorities,
          total: response.data.total,
        };
      });
  };

  return Priority;
});

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:PriorityIndexCtrl
 * @description
 * # PriorityIndexCtrl
 * Priority list controller of ng311
 */
angular
  .module('ng311')
  .controller('PriorityIndexCtrl', function(
    $rootScope,
    $scope,
    $state,
    Priority
  ) {
    //priorities in the scope
    $scope.spin = false;
    $scope.priorities = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * set current service request
     */
    $scope.select = function(priority) {
      //sort comments in desc order
      if (priority && priority._id) {
        //update scope service request ref
        $scope.priority = priority;
        $rootScope.$broadcast('priority:selected', priority);
      }

      $scope.create = false;
    };

    /**
     * @description load priorities
     */
    $scope.find = function() {
      //start sho spinner
      $scope.spin = true;

      Priority.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1,
        },
        filter: {},
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with priorities when done loading
          $scope.priorities = response.priorities;
          if ($scope.updated) {
            $scope.updated = false;
          } else {
            $scope.select(_.first($scope.priorities));
          }
          $scope.total = response.total;
          $scope.spin = false;
        })
        .catch(function(error) {
          $scope.spin = false;
        });
    };

    //check whether priorities will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.priorities && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //pre load priorities on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:priorities:reload', function() {
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:PriorityShowCtrl
 * @description
 * # PriorityShowCtrl
 * Priority show controller of ng311
 */
angular
  .module('ng311')
  .controller('PriorityShowCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    Priority
  ) {
    $scope.edit = false;

    /**
     * @function
     * @name setColorPickerOptions
     * @description Set or Update color picker options when need to change
     *
     * @version  0.1.0
     * @since 0.1.0
     */
    var setColorPickerOptions = function() {
      $scope.colorPickerOptions = {
        swatchPos: 'right',
        disabled: !$scope.edit,
        inputClass: 'form-control',
        format: 'hexString',
        round: true,
      };
    };

    $scope.onEdit = function() {
      $scope.edit = true;
      setColorPickerOptions();
    };

    $scope.onCancel = function() {
      $scope.edit = false;
      setColorPickerOptions();
      $rootScope.$broadcast('app:priorities:reload');
    };

    $scope.onNew = function() {
      $scope.priority = new Priority({ weight: 0, color: '#FF9800' });
      $scope.edit = true;
      setColorPickerOptions();
    };

    //TODO show empty state if no priority selected
    //listen for selected jurisdiction
    $rootScope.$on('priority:selected', function(event, priority) {
      $scope.priority = priority;
    });

    /**
     * @description save created priority
     */
    $scope.save = function() {
      //TODO show input prompt
      //TODO show loading mask

      //try update or save priority
      var updateOrSave = !$scope.priority._id
        ? $scope.priority.$save()
        : $scope.priority.$update();

      updateOrSave
        .then(function(response) {
          response = response || {};

          response.message = response.message || 'Priority Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:priorities:reload');

          $scope.edit = false;
          setColorPickerOptions();
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
        });
    };

    setColorPickerOptions();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Priority
 * @description
 * Priority states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //priorities management states
  $stateProvider.state('app.manage.priorities', {
    url: '/priorities',
    views: {
      list: {
        templateUrl: 'views/priorities/_partials/list.html',
        controller: 'PriorityIndexCtrl',
      },
      detail: {
        templateUrl: 'views/priorities/_partials/detail.html',
        controller: 'PriorityShowCtrl',
      },
    },
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Jurisdiction
 * @description
 * # Jurisdiction
 * Factory in the ng311.
 */
angular
  .module('ng311')
  .factory('Jurisdiction', function($http, $resource, Utils) {
    //create jurisdiction resource
    var Jurisdiction = $resource(
      Utils.asLink(['jurisdictions', ':id']),
      {
        id: '@_id',
      },
      {
        update: {
          method: 'PUT',
        },
      }
    );

    /**
     * @description find jurisdiction with pagination
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Jurisdiction.find = function(params) {
      return $http
        .get(Utils.asLink('v1/jurisdictions'), {
          params: params,
        })
        .then(function(response) {
          //map plain jurisdiction object to resource instances
          var jurisdictions = response.data.data.map(function(jurisdiction) {
            //create jurisdiction as a resource instance
            return new Jurisdiction(jurisdiction);
          });

          //return paginated response
          return {
            jurisdictions: jurisdictions,
            total: response.data.total,
          };
        });
    };

    return Jurisdiction;
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:JurisdictionIndexCtrl
 * @description
 * # JurisdictionIndexCtrl
 * Jurisdiction list controller of ng311
 */
angular
  .module('ng311')
  .controller('JurisdictionIndexCtrl', function(
    $rootScope,
    $scope,
    $state,
    Jurisdiction
  ) {
    //jurisdictions in the scope
    $scope.spin = false;
    $scope.jurisdictions = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * set current service request
     */
    $scope.select = function(jurisdiction) {
      //sort comments in desc order
      if (jurisdiction && jurisdiction._id) {
        //update scope service request ref
        $scope.jurisdiction = jurisdiction;
        $rootScope.$broadcast('jurisdiction:selected', jurisdiction);
      }

      $scope.create = false;
    };

    /**
     * @description load jurisdictions
     */
    $scope.find = function() {
      //start show spinner
      $scope.spin = true;

      Jurisdiction.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          updatedAt: -1,
          name: 1,
        },
        filter: {},
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with jurisdictions when done loading
          $scope.jurisdictions = response.jurisdictions;
          if ($scope.updated) {
            $scope.updated = false;
          } else {
            $scope.select(_.first($scope.jurisdictions));
          }
          $scope.total = response.total;
          $scope.spin = false;
        })
        .catch(function(error) {
          $scope.spin = false;
        });
    };

    //check whether jurisdictions will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.jurisdictions && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //pre load jurisdictions on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:jurisdictions:reload', function() {
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:JurisdictionShowCtrl
 * @description
 * # JurisdictionShowCtrl
 * Jurisdiction show controller of ng311
 */
angular
  .module('ng311')
  .controller('JurisdictionShowCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    Jurisdiction
  ) {
    $scope.edit = false;

    /**
     * @function
     * @name setColorPickerOptions
     * @description Set or Update color picker options when need to change
     *
     * @version  0.1.0
     * @since 0.1.0
     */
    var setColorPickerOptions = function() {
      $scope.colorPickerOptions = {
        swatchPos: 'right',
        disabled: !$scope.edit,
        inputClass: 'form-control',
        format: 'hexString',
        round: true,
      };
    };

    $scope.onEdit = function() {
      $scope.edit = true;
      setColorPickerOptions();
    };

    $scope.onCancel = function() {
      $scope.edit = false;
      setColorPickerOptions();
      $rootScope.$broadcast('app:jurisdictions:reload');
    };

    $scope.onNew = function() {
      $scope.jurisdiction = new Jurisdiction({
        location: {
          coordinates: [0, 0],
        },
      });
      $scope.edit = true;
      setColorPickerOptions();
    };

    //TODO show empty state if no jurisdiction selected
    //listen for selected jurisdiction
    $rootScope.$on('jurisdiction:selected', function(event, jurisdiction) {
      $scope.jurisdiction = jurisdiction;
    });

    /**
     * @description save created jurisdiction
     */
    $scope.save = function() {
      //TODO show input prompt
      //TODO show loading mask

      //update location(longitude & latitude) coordinates
      $scope.jurisdiction.location = {
        type: 'Point',
        coordinates: [
          $scope.jurisdiction.longitude || 0,
          $scope.jurisdiction.latitude || 0,
        ],
      };

      //try update or save jurisdiction
      /* jshint ignore:start */
      var updateOrSave = !$scope.jurisdiction._id
        ? $scope.jurisdiction.$save()
        : $scope.jurisdiction.$update();

      updateOrSave
        .then(function(response) {
          response = response || {};

          response.message =
            response.message || 'Jurisdiction Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:jurisdictions:reload');

          $scope.edit = false;
          setColorPickerOptions();
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
        });
      /* jshint ignore:end */
    };

    setColorPickerOptions();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Jurisdiction
 * @description
 * Jurisdiction states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //jurisdictions management states
  $stateProvider.state('app.manage.jurisdictions', {
    url: '/jurisdictions',
    views: {
      list: {
        templateUrl: 'views/jurisdictions/_partials/list.html',
        controller: 'JurisdictionIndexCtrl',
      },
      detail: {
        templateUrl: 'views/jurisdictions/_partials/detail.html',
        controller: 'JurisdictionShowCtrl',
      },
    },
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Item
 * @description
 * # Item
 * Factory in the ng311.
 */
angular.module('ng311').factory('Item', function($http, $resource, Utils) {
  //create service resource
  var Item = $resource(
    Utils.asLink(['v1/predefines/items', ':id']),
    {
      id: '@_id',
    },
    {
      update: {
        method: 'PUT',
      },
    }
  );

  /**
   * @description find service with pagination
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Item.find = function(params) {
    return $http
      .get(Utils.asLink('v1/predefines/items'), {
        params: params,
      })
      .then(function(response) {
        //map plain service object to resource instances
        var items = response.data.data.map(function(service) {
          //create service as a resource instance
          return new Item(service);
        });

        //return paginated response
        return {
          items: items,
          total: response.data.total,
        };
      });
  };

  return Item;
});

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ItemIndexCtrl
 * @description
 * # ItemIndexCtrl
 * Item list controller of ng311
 */
angular
  .module('ng311')
  .controller('ItemIndexCtrl', function($rootScope, $scope, $state, Item) {
    //items in the scope
    $scope.spin = false;
    $scope.items = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * set current item request
     */
    $scope.select = function(item) {
      //sort comments in desc order
      if (item && item._id) {
        //update scope item request ref
        $scope.item = item;
        $rootScope.$broadcast('item:selected', item);
      }

      $scope.create = false;
    };

    /**
     * @description load items
     */
    $scope.find = function() {
      //start sho spinner
      $scope.spin = true;

      Item.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          'name.en': 1,
        },
        filter: {},
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with items when done loading
          $scope.items = response.items;
          if ($scope.updated) {
            $scope.updated = false;
          } else {
            $scope.select(_.first($scope.items));
          }
          $scope.total = response.total;
          $scope.spin = false;
        })
        .catch(function(error) {
          $scope.spin = false;
        });
    };

    //check whether items will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.items && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //pre load items on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:items:reload', function() {
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ItemShowCtrl
 * @description
 * # ItemShowCtrl
 * Item show controller of ng311
 */
angular
  .module('ng311')
  .controller('ItemShowCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    Item
  ) {
    $scope.edit = false;

    /**
     * @function
     * @name setColorPickerOptions
     * @description Set or Update color picker options when need to change
     *
     * @version  0.1.0
     * @since 0.1.0
     */
    var setColorPickerOptions = function() {
      $scope.colorPickerOptions = {
        swatchPos: 'right',
        disabled: !$scope.edit,
        inputClass: 'form-control',
        format: 'hexString',
        round: true,
      };
    };

    $scope.onEdit = function() {
      $scope.edit = true;
      setColorPickerOptions();
    };

    $scope.onCancel = function() {
      $scope.edit = false;
      setColorPickerOptions();
      $rootScope.$broadcast('app:items:reload');
    };

    $scope.onNew = function() {
      $scope.item = new Item({});
      $scope.edit = true;
      setColorPickerOptions();
    };

    //TODO show empty state if no item selected
    //listen for selected item
    $rootScope.$on('item:selected', function(event, item) {
      $scope.item = item;
    });

    /**
     * @description save created item
     */
    $scope.save = function() {
      //TODO show input prompt
      //TODO show loading mask

      //try update or save item
      var updateOrSave = !$scope.item._id
        ? $scope.item.$save()
        : $scope.item.$update();

      updateOrSave
        .then(function(response) {
          response = response || {};

          response.message = response.message || 'Item Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:items:reload');

          $scope.edit = false;
          setColorPickerOptions();
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
        });
    };

    setColorPickerOptions();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Item
 * @description
 * Item states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //items management states
  $stateProvider.state('app.manage.items', {
    url: '/items',
    views: {
      list: {
        templateUrl: 'views/items/_partials/list.html',
        controller: 'ItemIndexCtrl',
      },
      detail: {
        templateUrl: 'views/items/_partials/detail.html',
        controller: 'ItemShowCtrl',
      },
    },
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Zone
 * @description
 * # Zone
 * Factory in the ng311.
 */
angular.module('ng311').factory('Zone', function($http, $resource, Utils) {
  //create service resource
  var Zone = $resource(
    Utils.asLink(['v1/predefines/zones', ':id']),
    {
      id: '@_id',
    },
    {
      update: {
        method: 'PUT',
      },
    }
  );

  /**
   * @description find service with pagination
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Zone.find = function(params) {
    return $http
      .get(Utils.asLink('v1/predefines/zones'), {
        params: params,
      })
      .then(function(response) {
        //map plain service object to resource instances
        var zones = response.data.data.map(function(service) {
          //create service as a resource instance
          return new Zone(service);
        });

        //return paginated response
        return {
          zones: zones,
          total: response.data.total,
        };
      });
  };

  return Zone;
});

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ZoneIndexCtrl
 * @description
 * # ZoneIndexCtrl
 * Zone list controller of ng311
 */
angular
  .module('ng311')
  .controller('ZoneIndexCtrl', function($rootScope, $scope, $state, Zone) {
    //zones in the scope
    $scope.spin = false;
    $scope.zones = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * set current zone request
     */
    $scope.select = function(zone) {
      //sort comments in desc order
      if (zone && zone._id) {
        //update scope zone request ref
        $scope.zone = zone;
        $rootScope.$broadcast('zone:selected', zone);
      }

      $scope.create = false;
    };

    /**
     * @description load zones
     */
    $scope.find = function() {
      //start sho spinner
      $scope.spin = true;

      Zone.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1,
        },
        filter: {},
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with zones when done loading
          $scope.zones = response.zones;
          if ($scope.updated) {
            $scope.updated = false;
          } else {
            $scope.select(_.first($scope.zones));
          }
          $scope.total = response.total;
          $scope.spin = false;
        })
        .catch(function(error) {
          $scope.spin = false;
        });
    };

    //check whether zones will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.zones && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //pre load zones on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:zones:reload', function() {
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:ZoneShowCtrl
 * @description
 * # ZoneShowCtrl
 * Zone show controller of ng311
 */
angular
  .module('ng311')
  .controller('ZoneShowCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    Zone
  ) {
    $scope.edit = false;

    /**
     * @function
     * @name setColorPickerOptions
     * @description Set or Update color picker options when need to change
     *
     * @version  0.1.0
     * @since 0.1.0
     */
    var setColorPickerOptions = function() {
      $scope.colorPickerOptions = {
        swatchPos: 'right',
        disabled: !$scope.edit,
        inputClass: 'form-control',
        format: 'hexString',
        round: true,
      };
    };

    $scope.onEdit = function() {
      $scope.edit = true;
      setColorPickerOptions();
    };

    $scope.onCancel = function() {
      $scope.edit = false;
      setColorPickerOptions();
      $rootScope.$broadcast('app:zones:reload');
    };

    $scope.onNew = function() {
      $scope.zone = new Zone({});
      $scope.edit = true;
      setColorPickerOptions();
    };

    //TODO show empty state if no zone selected
    //listen for selected zone
    $rootScope.$on('zone:selected', function(event, zone) {
      $scope.zone = zone;
    });

    /**
     * @description save created zone
     */
    $scope.save = function() {
      //TODO show input prompt
      //TODO show loading mask

      //try update or save zone
      var updateOrSave = !$scope.zone._id
        ? $scope.zone.$save()
        : $scope.zone.$update();

      updateOrSave
        .then(function(response) {
          response = response || {};

          response.message = response.message || 'Zone Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:zones:reload');

          $scope.edit = false;
          setColorPickerOptions();
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
        });
    };

    setColorPickerOptions();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Zone
 * @description
 * Zone states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //zones management states
  $stateProvider.state('app.manage.zones', {
    url: '/zones',
    views: {
      list: {
        templateUrl: 'views/zones/_partials/list.html',
        controller: 'ZoneIndexCtrl',
      },
      detail: {
        templateUrl: 'views/zones/_partials/detail.html',
        controller: 'ZoneShowCtrl',
      },
    },
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Role
 * @description
 * # Role
 * Factory in ng311
 */
angular.module('ng311').factory('Role', function($http, $resource, Utils) {
  //create role resource
  var Role = $resource(
    Utils.asLink(['roles', ':id']),
    {
      id: '@_id',
    },
    {
      update: {
        method: 'PUT',
      },
    }
  );

  /**
   * @description find roles with pagination
   * @param  {Object} params [description]
   */
  Role.find = function(params) {
    return $http
      .get(Utils.asLink('roles'), {
        params: params,
      })
      .then(function(response) {
        //map plain role object to resource instances
        var roles = response.data.roles.map(function(role) {
          //create role as a resource instance
          return new Role(role);
        });

        //return paginated response
        return {
          roles: roles,
          total: response.data.count,
        };
      });
  };

  return Role;
});

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:RoleIndexCtrl
 * @description
 * # RoleIndexCtrl
 * Role list controller of ng311
 */
angular
  .module('ng311')
  .controller('RoleIndexCtrl', function($rootScope, $scope, $state, Role) {
    //roles in the scope
    $scope.spin = false;
    $scope.roles = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * set current service request
     */
    $scope.select = function(role) {
      //sort comments in desc order
      if (role && role._id) {
        //update scope service request ref
        $scope.role = role;

        //deduce assigned roles
        role._assigned = _.map(role.permissions, '_id');

        $rootScope.$broadcast('role:selected', role);
      }

      $scope.create = false;
    };

    /**
     * @description load roles
     */
    $scope.find = function() {
      //start sho spinner
      $scope.spin = true;

      Role.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1,
        },
        filter: {},
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with roles when done loading
          $scope.roles = response.roles;
          if ($scope.updated) {
            $scope.updated = false;
          } else {
            $scope.select(_.first($scope.roles));
          }
          $scope.total = response.total;
          $scope.spin = false;
        })
        .catch(function(error) {
          $scope.spin = false;
        });
    };

    //check whether roles will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.roles && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //pre load roles on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:roles:reload', function() {
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:RoleShowCtrl
 * @description
 * # RoleShowCtrl
 * Role show controller of ng311
 */
angular
  .module('ng311')
  .controller('RoleShowCtrl', function(
    $rootScope,
    $scope,
    $state,
    $stateParams,
    Role,
    permissions
  ) {
    $scope.permissions = permissions.permissions;

    //prepare grouped permissions
    $scope.grouped = _.groupBy($scope.permissions, 'resource');
    $scope.grouped = _.map($scope.grouped, function(values, key) {
      return { resource: key, permits: values };
    });

    $scope.edit = false;

    $scope.onEdit = function() {
      $scope.edit = true;
    };

    $scope.onCancel = function() {
      $scope.edit = false;
      $rootScope.$broadcast('app:roles:reload');
    };

    $scope.onNew = function() {
      $scope.role = new Role({
        permissions: [],
      });
      $scope.edit = true;
    };

    /**
     * @description block created role
     */
    $scope.block = function() {
      //TODO show input prompt
      //TODO show loading mask
      $scope.role.deletedAt = new Date();
      $scope.save();
    };

    /**
     * @description unblock created role
     */
    $scope.unblock = function() {
      //TODO show input prompt
      //TODO show loading mask
      $scope.role.deletedAt = null;
      $scope.save();
    };

    //TODO show empty state if no role selected
    //listen for selected juridiction
    $rootScope.$on('role:selected', function(event, role) {
      $scope.role = role;
    });

    /**
     * @description save created role
     */
    $scope.save = function() {
      //TODO show input prompt
      //TODO show loading mask

      //update assigned permissions
      $scope.role.permissions = $scope.role._assigned;

      //try update or save role
      var updateOrSave = !$scope.role._id
        ? $scope.role.$save()
        : $scope.role.$update();

      updateOrSave
        .then(function(response) {
          response = response || {};

          response.message = response.message || 'Role Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:roles:reload');

          $scope.edit = false;
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
        });
    };
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Role
 * @description
 * Role states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //role management states
  $stateProvider.state('app.manage.roles', {
    url: '/roles',
    views: {
      list: {
        templateUrl: 'views/roles/_partials/list.html',
        controller: 'RoleIndexCtrl',
      },
      detail: {
        templateUrl: 'views/roles/_partials/detail.html',
        controller: 'RoleShowCtrl',
        resolve: {
          permissions: function(Permission) {
            return Permission.find();
          },
        },
      },
    },
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Party
 * @description
 * # Party
 * Factory in the ng311.
 */
angular.module('ng311').factory('Party', function($http, $resource, Utils) {
  //create party resource
  var Party = $resource(
    Utils.asLink(['parties', ':id']),
    {
      id: '@_id',
    },
    {
      update: {
        method: 'PUT',
      },
    }
  );

  /**
   * @description find party with pagination
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Party.find = function(params) {
    //ensure roles is populated
    params = _.merge({}, params, {
      populate: [{ path: 'roles' }],
    });

    return $http
      .get(Utils.asLink('parties'), {
        params: params,
      })
      .then(function(response) {
        //map plain party object to resource instances
        var parties = response.data.parties.map(function(party) {
          //create party as a resource instance
          return new Party(party);
        });

        //return paginated response
        return {
          parties: parties,
          total: response.data.count,
        };
      });
  };

  /**
   * @description request party password recover from backend
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Party.requestRecover = function(params) {
    return $http.put(Utils.asLink('forgot'), params).then(function(response) {
      return response.data;
    });
  };

  /**
   * @description send party password recovery to backend
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Party.recover = function(params) {
    return $http.put(Utils.asLink('recover'), params).then(function(response) {
      return response.data;
    });
  };

  /**
   * @description confirm party account
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Party.confirm = function(params) {
    return $http.put(Utils.asLink('confirm'), params).then(function(response) {
      return response.data;
    });
  };

  /**
   * @description change party password
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Party.change = function(params) {
    return $http.put(Utils.asLink('change'), params).then(function(response) {
      return response.data;
    });
  };

  /**
   * @description unlock given locked party account
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Party.unlock = function(params) {
    return $http.put(Utils.asLink('unlock'), params).then(function(response) {
      return response.data;
    });
  };

  /**
   * @description Obtain given party performances reports
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  Party.performances = function(params) {
    var _id = params._id;
    params = _.omit(params, '_id');

    return $http
      .get(Utils.asLink(['parties', _id, 'performances']), {
        params: params,
      })
      .then(function(response) {
        return response.data;
      });
  };

  return Party;
});

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:PartyIndexCtrl
 * @description
 * # PartyIndexCtrl
 * Party list controller of ng311
 */
angular
  .module('ng311')
  .controller('PartyIndexCtrl', function($rootScope, $scope, $state, Party) {
    //parties in the scope
    $scope.spin = false;
    $scope.parties = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function() {
      if ($scope.search.q && $scope.search.q.length >= 2) {
        $scope.q = $scope.search.q;
        $scope.find();
      } else {
        $scope.q = undefined;
        $scope.find();
      }
    };

    /**
     * set current service request
     */
    $scope.select = function(party) {
      //sort comments in desc order
      if (party && party._id) {
        //prepare displayable roles
        party._roles =
          party.roles && !_.isEmpty(party.roles)
            ? _.join(_.map(party.roles, 'name'), ', ')
            : 'N/A';

        //deduce assigned roles
        party._assigned = _.map(party.roles, '_id');

        //ensure relation
        party.relation = party.relation || {};

        //update scope service request ref
        $scope.party = party;
        $rootScope.$broadcast('party:selected', party);
      }

      $scope.create = false;
    };

    /**
     * @description load parties
     */
    $scope.find = function() {
      //start sho spinner
      $scope.spin = true;

      Party.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1,
        },
        filter: {},
        q: $scope.q,
      })
        .then(function(response) {
          //update scope with parties when done loading
          $scope.parties = response.parties;
          if ($scope.updated) {
            $scope.updated = false;
          } else {
            $scope.select(_.first($scope.parties));
          }
          $scope.total = response.total;
          $scope.spin = false;
        })
        .catch(function(error) {
          $scope.spin = false;
        });
    };

    //check whether parties will paginate
    $scope.willPaginate = function() {
      var willPaginate =
        $scope.parties && $scope.total && $scope.total > $scope.limit;
      return willPaginate;
    };

    //pre load parties on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:parties:reload', function() {
      $scope.find();
    });
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:PartyShowCtrl
 * @description
 * # PartyShowCtrl
 * Party show controller of ng311
 */
angular
  .module('ng311')
  .controller('PartyShowCtrl', function(
    $rootScope,
    $scope,
    Party,
    roles,
    party,
    Jurisdiction,
    Zone
  ) {
    $scope.edit = false;
    $scope.canSave = true;
    $scope.passwordDontMatch = false;
    $scope.roles = roles.roles;

    $scope.workspaces = party.settings.party.relation.workspaces;

    $scope.onEdit = function() {
      $scope.edit = true;
    };

    $scope.onCancel = function() {
      $scope.edit = false;
      $rootScope.$broadcast('app:parties:reload');
    };

    $scope.onNew = function() {
      $scope.party = new Party({
        relation: {},
        roles: [],
        _assigned: [],
      });
      $scope.edit = true;
    };

    /**
     * @description block created party
     */
    $scope.block = function() {
      //TODO show input prompt
      //TODO show loading mask
      $scope.party.deletedAt = new Date();
      $scope.party.lockedAt = new Date();
      $scope.save();
    };

    /**
     * @description unblock created party
     */
    $scope.unblock = function() {
      //TODO show input prompt
      //TODO show loading mask
      //clear soft delete data
      $scope.party.deletedAt = null;

      //clear locking data
      $scope.party.failedAttempts = 0;
      $scope.party.lockedAt = null;
      $scope.party.unlockedAt = null;
      $scope.party.unlockToken = null;
      $scope.party.unlockSentAt = null;
      $scope.party.unlockTokenExpiryAt = null;

      //set password to guest
      //TODO allow password change
      $scope.party.password = 'guest';

      $scope.save();
    };

    //TODO show empty state if no party selected
    //listen for selected juridiction
    $rootScope.$on('party:selected', function(event, party) {
      $scope.party = party;
    });

    /**
     * Listen for password confirmation input changes
     */
    $scope.onConfirmPassword = function() {
      if (!$scope.party.confirm || !$scope.party.password) {
        $scope.passwordDontMatch = false;
      } else {
        $scope.passwordDontMatch = !(
          $scope.party.password === $scope.party.confirm
        );
        $scope.canSave =
          $scope.party.password.length >= 8 &&
          $scope.party.password === $scope.party.confirm;
      }
    };

    /**
     * Listen for password input changes
     */
    $scope.onPasswordChange = function() {
      if (!$scope.party.password) {
        $scope.canSave = true;
      } else {
        $scope.canSave =
          $scope.party.password.length >= 8 &&
          $scope.party.password === $scope.party.confirm;
      }
    };

    /**
     * @function
     * @name searchJurisdictions
     * @description Search jurisdictions by name
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.searchJurisdictions = function(query) {
      return Jurisdiction.find({ q: query }).then(function(response) {
        return response.jurisdictions;
      });
    };

    /**
     * @function
     * @name searchZones
     * @description Search zones by name
     *
     * @version 0.1.0
     * @since 0.1.0
     */
    $scope.searchZones = function(query) {
      return Zone.find({ q: query }).then(function(response) {
        return response.zones;
      });
    };

    /**
     * @description save created party
     */
    $scope.save = function() {
      //TODO show input prompt
      //TODO show loading mask

      //update party assigned roles
      $scope.party.roles = $scope.party._assigned;

      //try update or save party
      var updateOrSave = !$scope.party._id
        ? $scope.party.$save()
        : $scope.party.$update();

      updateOrSave
        .then(function(response) {
          response = response || {};

          response.message = response.message || 'Party Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:parties:reload');

          //re-select saved party
          // $rootScope.$broadcast('party:selected', $scope.party);

          $scope.edit = false;
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
        });
    };
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Party
 * @description
 * Party states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //parties management states
  $stateProvider.state('app.manage.parties', {
    url: '/parties',
    views: {
      list: {
        templateUrl: 'views/parties/_partials/list.html',
        controller: 'PartyIndexCtrl',
      },
      detail: {
        templateUrl: 'views/parties/_partials/detail.html',
        controller: 'PartyShowCtrl',
        resolve: {
          jurisdictions: function(Jurisdiction) {
            return Jurisdiction.find({
              limit: 1000,
              filter: {
                deletedAt: {
                  $eq: null,
                },
              },
            });
          },
          zones: function(Zone) {
            return Zone.find({
              limit: 1000,
              filter: {
                deletedAt: {
                  $eq: null,
                },
              },
            });
          },
        },
      },
    },
    data: {
      authenticated: true,
    },
    resolve: {
      roles: function(Role) {
        return Role.find({
          limit: 1000,
          filter: {
            deletedAt: {
              $eq: null,
            },
          },
        });
      },
    },
  });
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Summary
 * @description
 * # Summary
 * Factory in ng311
 * //TODO rename to reports
 */
angular.module('ng311').factory('Summary', function($http, $resource, Utils) {
  var Summary = {};

  /**
   * @description find roles with pagination
   * @param  {Object} params [description]
   */
  Summary.issues = function(params) {
    return $http
      .get(Utils.asLink('summaries'), {
        params: params,
      })
      .then(function(response) {
        return response.data;
      });
  };

  /**
   * @description load all api endpoint in singe request to improve
   *              ui responsiveness
   * @param  {Object} params additional params
   * @return {Object}
   */
  Summary.endpoints = function(params) {
    return $http
      .get(Utils.asLink('endpoints'), {
        params: params,
      })
      .then(function(response) {
        return response.data;
      });
  };

  /**
   * @description load current overview/pipeline
   * @param  {Object} params additional params
   * @return {Object}
   */
  Summary.overviews = function(params) {
    return $http
      .get(Utils.asLink(['reports', 'overviews']), {
        params: params,
      })
      .then(function(response) {
        return response.data;
      });
  };

  /**
   * @description load current standings
   * @param  {Object} params additional params
   * @return {Object}
   */
  Summary.standings = function(params) {
    return $http
      .get(Utils.asLink(['reports', 'standings']), {
        params: params,
      })
      .then(function(response) {
        return response.data;
      });
  };

  /**
   * @description load current performances
   * @param  {Object} params additional params
   * @return {Object}
   */
  Summary.performances = function(params) {
    return $http
      .get(Utils.asLink(['reports', 'performances']), {
        params: params,
      })
      .then(function(response) {
        return response.data;
      });
  };

  /**
   * Build params as per API filtering, sorting and paging
   * @param  {Object} [params] reports filters
   * @return {Object}
   */
  Summary.prepareQuery = function(params) {
    //ensure params
    params = _.merge({}, params);

    //initialize query
    var query = {};

    /* jshint ignore:start */
    //1. ensure start and end dates
    //1.0 ensure start date
    params.startedAt = params.startedAt
      ? moment(new Date(params.startedAt))
          .utc()
          .startOf('date')
      : moment()
          .utc()
          .startOf('date');
    //1.1 ensure end date
    params.endedAt = params.endedAt
      ? moment(new Date(params.endedAt))
          .utc()
          .endOf('date')
      : moment()
          .utc()
          .endOf('date');
    /* jshint ignore:end */

    //1.2 ensure start is less than end
    var startedAt = params.startedAt;
    if (params.startedAt.isAfter(params.endedAt)) {
      params.startedAt = params.endedAt;
      params.endedAt = startedAt;
    }
    //1.3 build start & end date criteria
    query.createdAt = {
      $gte: params.startedAt.startOf('date').toDate(),
      $lte: params.endedAt.endOf('date').toDate(),
    };

    //2. ensure jurisdictions
    //2.0 normalize & compact jurisdictions
    params.jurisdictions = _.uniq(_.compact([].concat(params.jurisdictions)));
    //2.1 build jurisdiction criteria
    if (params.jurisdictions.length >= 1) {
      if (params.jurisdictions.length > 1) {
        //use $in criteria
        query.jurisdiction = { $in: params.jurisdictions };
      } else {
        //use $eq criteria
        query.jurisdiction = _.first(params.jurisdictions);
      }
    }

    //ensure service groups
    //3. ensure servicegroups
    //3.0 normalize & compact servicegroups
    params.servicegroups = _.uniq(_.compact([].concat(params.servicegroups)));
    //3.1 build group criteria
    if (params.servicegroups.length >= 1) {
      if (params.servicegroups.length > 1) {
        //use $in criteria
        query.group = { $in: params.servicegroups };
      } else {
        //use $eq criteria
        query.group = _.first(params.servicegroups);
      }
    }

    //ensure services
    //4. ensure services
    //4.0 normalize & compact services
    params.services = _.uniq(_.compact([].concat(params.services)));
    //4.1 build service criteria
    if (params.services.length >= 1) {
      if (params.services.length > 1) {
        //use $in criteria
        query.service = { $in: params.services };
      } else {
        //use $eq criteria
        query.service = _.first(params.services);
      }
    }

    //ensure statuses
    //5. ensure statuses
    //5.0 normalize & compact statuses
    params.statuses = _.uniq(_.compact([].concat(params.statuses)));
    //5.1 build status criteria
    if (params.statuses.length >= 1) {
      if (params.statuses.length > 1) {
        //use $in criteria
        query.status = { $in: params.statuses };
      } else {
        //use $eq criteria
        query.status = _.first(params.statuses);
      }
    }

    //ensure priorities
    //6. ensure priorities
    //6.0 normalize & compact priorities
    params.priorities = _.uniq(_.compact([].concat(params.priorities)));
    //6.1 build priority criteria
    if (params.priorities.length >= 1) {
      if (params.priorities.length > 1) {
        //use $in criteria
        query.priority = { $in: params.priorities };
      } else {
        //use $eq criteria
        query.priority = _.first(params.priorities);
      }
    }

    //ensure workspaces
    //7. ensure workspaces
    //7.0 normalize & compact workspaces
    params.workspaces = _.uniq(_.compact([].concat(params.workspaces)));
    //7.1 build priority criteria
    if (params.workspaces.length >= 1) {
      // query.method = {};
      if (params.workspaces.length > 1) {
        //use $in criteria
        query['method.workspace'] = { $in: params.workspaces };
      } else {
        //use $eq criteria
        query['method.workspace'] = _.first(params.workspaces);
      }
    }

    return query;
  };

  return Summary;
});

'use strict';

/**
 * @ngdoc service
 * @name ng311.Setting
 * @description
 * # Setting
 * Factory in ng311
 */
angular.module('ng311').factory('Setting', function($http, $resource, Utils) {
  //create setting resource
  var Setting = $resource(
    Utils.asLink(['settings', ':id']),
    {
      id: '@_id',
    },
    {
      update: {
        method: 'PUT',
      },
    }
  );

  /**
   * @description find settings with pagination
   * @param  {Object} params [description]
   */
  Setting.find = function(params) {
    return $http
      .get(Utils.asLink('settings'), {
        params: params,
      })
      .then(function(response) {
        //map plain setting object to resource instances
        var settings = response.data.settings.map(function(setting) {
          //create setting as a resource instance
          return new Setting(setting);
        });

        //return paginated response
        return {
          settings: settings,
          total: response.data.count,
        };
      });
  };

  /**
   * @description bulk update applications settings
   * @param  {Object} data [description]
   */
  Setting.bulkUpdate = function(data) {
    var fakeId = new Date().getTime().toString();
    data = angular.toJson(data);

    return $http.put(Utils.asLink(['settings', fakeId]), data);
  };

  return Setting;
});

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:SettingIndexCtrl
 * @description
 * # SettingIndexCtrl
 * Setting list controller of ng311
 */
angular
  .module('ng311')
  .controller('SettingIndexCtrl', function(
    $rootScope,
    $scope,
    $state,
    ENV,
    Setting
  ) {
    //signal if its editing process
    $scope.edit = false;

    //use only editable properties
    $scope.settings = $rootScope.party.settings || {};

    $scope.onEdit = function() {
      $scope.edit = true;
    };

    $scope.onClose = function() {
      $scope.edit = false;
    };

    /**
     * @description save edited customer
     */
    $scope.save = function() {
      //check if password edited
      var passwordChanged = !!$scope.party.password;

      //TODO show input prompt
      //TODO show loading mask
      Setting.bulkUpdate([$scope.settings])
        .then(function(response) {
          response = response || {};

          //update settings
          var data = response.data || {};
          $rootScope.settings = angular.merge({}, ENV.settings, data);

          response.message =
            response.message || 'Application settings updated successfully';

          $scope.edit = false;

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('setting:update:success');

          $state.go('app.settings');
        })
        .catch(function(error) {
          $rootScope.$broadcast('appError', error);
          $state.go('app.settings');
        });
    };
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Setting
 * @description
 * Setting states configuration of ng311
 */
angular.module('ng311').config(function($stateProvider) {
  //setting management states
  $stateProvider.state('app.manage.settings', {
    url: '/settings',
    templateUrl: 'views/settings/index.html',
    controller: 'SettingIndexCtrl',
    data: {
      authenticated: true,
    },
  });
});

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:DashboardOverviewCtrl
 * @description
 * # DashboardOverviewCtrl
 * dashboard overview controller of ng311
 */
angular
  .module('ng311')
  .controller('DashboardOverviewCtrl', function(
    $rootScope,
    $scope,
    $filter,
    $state,
    $uibModal,
    Summary,
    endpoints,
    party
  ) {
    //initialize scope attributes
    $scope.maxDate = new Date();

    //bind states
    $scope.priorities = endpoints.priorities.priorities;
    $scope.statuses = endpoints.statuses.statuses;
    $scope.services = endpoints.services.services;
    $scope.servicegroups = endpoints.servicegroups.servicegroups;
    $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;
    $scope.workspaces = party.settings.party.relation.workspaces;

    //bind filters
    var defaultFilters = {
      startedAt: moment()
        .utc()
        .startOf('date')
        .toDate(),
      endedAt: moment()
        .utc()
        .endOf('date')
        .toDate(),
      statuses: [],
      priorities: [],
      servicegroups: [],
      jurisdictions: [],
      workspaces: [],
    };

    //TODO persist filter to local storage
    $scope.filters = defaultFilters;

    //bind exports
    $scope.exports = {
      jurisdictions: {
        filename: 'areas_overview_reports_' + Date.now() + '.csv',
        headers: [
          'Area',
          'Total',
          'Pending',
          'Resolved',
          'Late',
          'Average Attend Time (Call Duration)',
          'Average Resolve Time',
        ],
      },
      groups: {
        filename: 'service_groups_overview_reports_' + Date.now() + '.csv',
        headers: [
          'Service Group',
          'Total',
          'Pending',
          'Resolved',
          'Late',
          'Average Attend Time (Call Duration)',
          'Average Resolve Time',
        ],
      },
      services: {
        filename: 'services_overview_reports_' + Date.now() + '.csv',
        headers: [
          'Service',
          'Total',
          'Pending',
          'Resolved',
          'Late',
          'Average Attend Time (Call Duration)',
          'Average Resolve Time',
        ],
      },
      methods: {
        filename: 'reporting_methods_overview_reports_' + Date.now() + '.csv',
        headers: ['Name', 'Total'],
      },
      workspaces: {
        filename: 'workspaces_overview_reports_' + Date.now() + '.csv',
        headers: ['Name', 'Total'],
      },
    };

    //initialize overviews
    $scope.overviews = {};

    /**
     * Exports current overview data
     */
    $scope.export = function(type) {
      var _exports = _.map($scope.overviews[type], function(overview) {
        overview = {
          name: overview.name,
          total: overview.count,
          pending: overview.pending,
          resolved: overview.resolved,
          late: overview.late,
          averageAttendTime: overview.averageAttendTime
            ? [
                overview.averageAttendTime.days,
                ' days, ',
                overview.averageAttendTime.hours,
                ' hrs, ',
                overview.averageAttendTime.minutes,
                ' mins, ',
                overview.averageAttendTime.seconds,
                ' secs',
              ].join('')
            : undefined,
          averageResolveTime: overview.averageResolveTime
            ? [
                overview.averageResolveTime.days,
                'days, ',
                overview.averageResolveTime.hours,
                'hrs, ',
                overview.averageResolveTime.minutes,
                'mins, ',
                overview.averageResolveTime.seconds,
                'secs, ',
              ].join('')
            : undefined,
        };

        //reshape for workspace and method
        if (type === 'methods' || type === 'workspaces') {
          overview = _.pick(overview, ['name', 'total']);
        }

        return overview;
      });

      return _exports;
    };

    /**
     * Open overview reports filter
     */
    $scope.showFilter = function() {
      //open overview reports filter modal
      $scope.modal = $uibModal.open({
        templateUrl: 'views/dashboards/_partials/overviews_filter.html',
        scope: $scope,
        size: 'lg',
      });

      //handle modal close and dismissed
      $scope.modal.result.then(
        function onClose(/*selectedItem*/) {},
        function onDismissed() {}
      );
    };

    /**
     * Filter overview reports based on on current selected filters
     * @param {Boolean} [reset] whether to clear and reset filter
     */
    $scope.filter = function(reset) {
      if (reset) {
        $scope.filters = defaultFilters;
      }

      //prepare query
      $scope.params = Summary.prepareQuery($scope.filters);

      //load reports
      $scope.reload();

      //close current modal
      $scope.modal.close();
    };

    /**
     * Filter service based on selected service group
     */
    $scope.filterServices = function() {
      //check for service group filter activation
      var filterHasServiceGroups =
        $scope.filters.servicegroups && $scope.filters.servicegroups.length > 0;

      //pick only service of selected group
      if (filterHasServiceGroups) {
        //filter services based on service group(s)
        $scope.services = _.filter(endpoints.services.services, function(
          service
        ) {
          var group = _.get(service, 'group._id', _.get(service, 'group'));
          return _.includes($scope.filters.servicegroups, group);
        });
      }
      //use all services
      else {
        $scope.services = endpoints.services.services;
      }
    };

    $scope.prepare = function() {
      //update export filename
      $scope.exports.filename = 'overview_reports_' + Date.now() + '.csv';

      // prepare percentages
      $scope.prepareOverallPercentages();

      //prepare charts
      $scope.prepareServiceVisualization();
      $scope.prepareJurisdictionVisualization();
      $scope.prepareServiceGroupVisualization();
      $scope.prepareMethodVisualization();
      $scope.prepareWorkspaceVisualization();
    };

    /**
     * prepare percentages for pending,resolved and late service requests in respect to total
     * service requests
     * @version 0.1.0
     * @since 0.1.0
     * @author Benson Maruchu<benmaruchu@gmail.com>
     */
    $scope.prepareOverallPercentages = function() {
      var overallExists = _.get($scope.overviews, 'overall', false);

      // check if overall data exists
      if (overallExists) {
        var percentages = {
          percentageResolved:
            ($scope.overviews.overall.resolved /
              $scope.overviews.overall.count) *
            100,
          percentagePending:
            ($scope.overviews.overall.pending /
              $scope.overviews.overall.count) *
            100,
          percentageLate:
            ($scope.overviews.overall.late / $scope.overviews.overall.count) *
            100,
        };

        $scope.overviews.overall = _.merge(
          {},
          $scope.overviews.overall,
          percentages
        );
      }
    };

    /**
     * prepare per service bar chart
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareServiceVisualization = function(column) {
      //ensure column
      column = column || 'count';

      //prepare unique services for bar chart categories
      var categories = _.chain($scope.overviews)
        .map('services')
        .uniqBy('name')
        .value();

      //prepare bar chart series data
      var data = _.map($scope.overviews.services, function(service) {
        var serie = {
          name: service.name,
          value: service[column],
          itemStyle: {
            normal: {
              color: service.color,
            },
          },
        };

        return serie;
      });

      //sort data by their value
      data = _.orderBy(data, 'value', 'asc');

      //prepare chart config
      $scope.perServiceConfig = {
        height: '1100',
        forceClear: true,
      };

      //prepare chart options
      $scope.perServiceOptions = {
        color: _.map(data, 'itemStyle.normal.color'),
        textStyle: {
          fontFamily: 'Lato',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Services Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        calculable: true,
        yAxis: [
          {
            type: 'category',
            data: _.map(data, 'name'),
            boundaryGap: true,
            axisTick: {
              alignWithLabel: true,
            },
            axisLabel: {
              rotate: 60,
            },
            axisLine: {
              show: true,
            },
          },
        ],
        xAxis: [
          {
            type: 'value',
            scale: true,
            position: 'top',
            boundaryGap: true,
            axisTick: {
              show: false,
              lineStyle: {
                color: '#ddd',
              },
            },
            splitLine: {
              show: false,
            },
          },
        ],
        series: [
          {
            type: 'bar',
            barWidth: '55%',
            label: {
              normal: {
                show: true,
                position: 'right',
              },
            },
            data: data,
          },
        ],
      };
    };

    /**
     * prepare jurisdiction overview visualization
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareJurisdictionVisualization = function(column) {
      //ensure column
      column = column || 'count';

      //prepare chart series data
      var data = _.map($scope.overviews.jurisdictions, function(jurisdiction) {
        return {
          name: jurisdiction.name,
          value: jurisdiction[column],
        };
      });

      //prepare chart config
      $scope.perJurisdictionConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perJurisdictionOptions = {
        textStyle: {
          fontFamily: 'Lato',
        },
        title: {
          text:
            column === 'count' ? 'Total' : _.upperFirst(column.toLowerCase()),
          subtext: $filter('number')(_.sumBy(data, 'value'), 0),
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: '{b}:<br/> Count: {c} <br/> Percent: ({d}%)',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Areas Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        series: [
          {
            type: 'pie',
            selectedMode: 'single',
            radius: ['45%', '55%'],
            color: _.map($scope.overviews.jurisdictions, 'color'),
            label: {
              normal: {
                formatter: '{b}\n{d}%\n( {c} )',
              },
            },
            data: data,
          },
        ],
      };
    };

    /**
     * prepare service group overview visualization
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareServiceGroupVisualization = function(column) {
      //ensure column
      column = column || 'count';

      //prepare chart series data
      var data = _.map($scope.overviews.groups, function(group) {
        return {
          name: group.name,
          value: group[column],
        };
      });

      //prepare chart config
      $scope.perServiceGroupConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perServiceGroupOptions = {
        textStyle: {
          fontFamily: 'Lato',
        },
        title: {
          text:
            column === 'count' ? 'Total' : _.upperFirst(column.toLowerCase()),
          subtext: $filter('number')(_.sumBy(data, 'value'), 0),
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: '{b}:<br/> Count: {c} <br/> Percent: ({d}%)',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Service Groups Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        series: [
          {
            type: 'pie',
            selectedMode: 'single',
            radius: ['45%', '55%'],
            color: _.map($scope.overviews.groups, 'color'),

            label: {
              normal: {
                formatter: '{b}\n{d}%\n( {c} )',
              },
            },
            data: data,
          },
        ],
      };
    };

    /**
     * prepare method overview visualization
     * @return {object} echart pie chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareMethodVisualization = function(column) {
      //ensure column
      column = column || 'count';

      //prepare chart series data
      var data = _.map($scope.overviews.methods, function(method) {
        return {
          name: method.name,
          value: method[column],
        };
      });

      //prepare chart config
      $scope.perMethodConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perMethodOptions = {
        textStyle: {
          fontFamily: 'Lato',
        },
        title: {
          text:
            column === 'count' ? 'Total' : _.upperFirst(column.toLowerCase()),
          subtext: $filter('number')(_.sumBy(data, 'value'), 0),
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: '{b}:<br/> Count: {c} <br/> Percent: ({d}%)',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Reporting Methods Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        series: [
          {
            type: 'pie',
            selectedMode: 'single',
            radius: ['45%', '55%'],
            color: _.map($scope.overviews.services, 'color'),
            label: {
              normal: {
                formatter: '{b}\n{d}%\n( {c} )',
              },
            },
            data: data,
          },
        ],
      };
    };

    /**
     * prepare workspace overview visualization
     * @return {object} echart pie chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareWorkspaceVisualization = function(column) {
      //ensure column
      column = column || 'count';

      //prepare chart series data
      var data = _.map($scope.overviews.workspaces, function(workspace) {
        return {
          name: workspace.name,
          value: workspace[column],
        };
      });

      //prepare chart config
      $scope.perWorkspaceConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perWorkspaceOptions = {
        textStyle: {
          fontFamily: 'Lato',
        },
        title: {
          text:
            column === 'count' ? 'Total' : _.upperFirst(column.toLowerCase()),
          subtext: $filter('number')(_.sumBy(data, 'value'), 0),
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: '{b}:<br/> Count: {c} <br/> Percent: ({d}%)',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Workspaces Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        series: [
          {
            type: 'pie',
            selectedMode: 'single',
            radius: ['45%', '55%'],
            color: _.reverse(_.map($scope.overviews.services, 'color')),
            label: {
              normal: {
                formatter: '{b}\n{d}%\n( {c} )',
              },
            },
            data: data,
          },
        ],
      };
    };

    /**
     * Reload overview reports
     */
    $scope.reload = function() {
      Summary.overviews({
        filter: $scope.params,
      }).then(function(overviews) {
        $scope.overviews = overviews;
        $scope.prepare();
      });
    };

    //listen for events and reload overview accordingly
    $rootScope.$on('app:servicerequests:reload', function() {
      $scope.reload();
    });

    //pre-load reports
    //prepare overview details
    $scope.params = Summary.prepareQuery($scope.filters);
    $scope.reload();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:DashboardStandingCtrl
 * @description
 * # DashboardStandingCtrl
 * dashboard daily standing controller of ng311
 */
angular
  .module('ng311')
  .controller('DashboardStandingCtrl', function(
    $rootScope,
    $scope,
    $state,
    $uibModal,
    Summary,
    endpoints,
    party
  ) {
    //initialize scope attributes
    $scope.maxDate = new Date();

    //bind states
    $scope.priorities = endpoints.priorities.priorities;
    $scope.statuses = endpoints.statuses.statuses;
    $scope.services = endpoints.services.services;
    $scope.servicegroups = endpoints.servicegroups.servicegroups;
    $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;
    $scope.workspaces = party.settings.party.relation.workspaces;

    //bind filters
    var defaultFilters = {
      startedAt: moment()
        .utc()
        .startOf('date')
        .toDate(),
      endedAt: moment()
        .utc()
        .endOf('date')
        .toDate(),
      statuses: [],
      priorities: [],
      servicegroups: [],
      jurisdictions: [],
      workspaces: [],
    };

    $scope.filters = defaultFilters;

    //bind exports
    $scope.maxDate = new Date();
    $scope.exports = {
      filename: 'standing_reports_' + Date.now() + '.csv',
      headers: [
        'Area',
        'Service Group',
        'Service',
        'Status',
        'Priority',
        'Count',
      ],
    };

    //initialize standings
    $scope.standings = [];

    /**
     * Exports current standing data
     */
    $scope.export = function() {
      var _exports = _.map($scope.standings, function(standing) {
        return {
          jurisdiction: standing.jurisdiction.name,
          servicegroup: standing.group.name,
          service: standing.service.name,
          status: standing.status.name,
          priority: standing.priority.name,
          count: standing.count,
        };
      });
      return _exports;
    };

    /**
     * Open overview reports filter
     */
    $scope.showFilter = function() {
      //open overview reports filter modal
      $scope.modal = $uibModal.open({
        templateUrl: 'views/dashboards/_partials/standings_filter.html',
        scope: $scope,
        size: 'lg',
      });

      //handle modal close and dismissed
      $scope.modal.result.then(
        function onClose(/*selectedItem*/) {},
        function onDismissed() {}
      );
    };

    /**
     * Filter overview reports based on on current selected filters
     * @param {Boolean} [reset] whether to clear and reset filter
     */
    $scope.filter = function(reset) {
      if (reset) {
        $scope.filters = defaultFilters;
      }

      //prepare query
      $scope.params = Summary.prepareQuery($scope.filters);

      //load reports
      $scope.reload();

      //close current modal
      $scope.modal.close();
    };

    /**
     * Filter service based on selected service group
     */
    $scope.filterServices = function() {
      //check for service group filter activation
      var filterHasServiceGroups =
        $scope.filters.servicegroups && $scope.filters.servicegroups.length > 0;

      //pick only service of selected group
      if (filterHasServiceGroups) {
        //filter services based on service group(s)
        $scope.services = _.filter(endpoints.services.services, function(
          service
        ) {
          var group = _.get(service, 'group._id', _.get(service, 'group'));
          return _.includes($scope.filters.servicegroups, group);
        });
      }
      //use all services
      else {
        $scope.services = endpoints.services.services;
      }
    };

    /**
     * Prepare standing reports for display
     */
    $scope.prepare = function() {
      //notify no data loaded
      // if (!$scope.standings || $scope.standings.length <= 0) {
      //   $rootScope.$broadcast('appWarning', {
      //     message: 'No Data Found. Please Update Your Filters.'
      //   });
      // }

      //update export filename
      $scope.exports.filename = 'standing_reports_' + Date.now() + '.csv';

      //build reports
      $scope.prepareIssuePerJurisdiction();
      $scope.prepareIssuePerJurisdictionPerServiceGroup();
      $scope.prepareIssuePerJurisdictionPerService();
      $scope.prepareIssuePerJurisdictionPerPriority();
      $scope.prepareIssuePerJurisdictionPerStatus();
    };

    /**
     * prepare per jurisdiction
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareIssuePerJurisdiction = function() {
      //prepare unique jurisdictions for bar chart categories
      var categories = _.chain($scope.standings)
        .map('jurisdiction')
        .sortBy('name')
        .uniqBy('name')
        .value();

      //prepare unique jurisdiction color for bar chart and legends color
      var colors = _.map(categories, 'color');

      //prepare unique jurisdiction name for bar chart legends label
      var legends = _.map(categories, 'name');

      //prepare bar chart series data
      var data = _.map(categories, function(category) {
        //obtain all standings of specified jurisdiction(category)
        var value = _.filter($scope.standings, function(standing) {
          return standing.jurisdiction.name === category.name;
        });
        value = value ? _.sumBy(value, 'count') : 0;
        var serie = {
          name: category.name,
          value: value,
          itemStyle: {
            normal: {
              color: category.color,
            },
          },
        };

        return serie;
      });

      //prepare chart config
      $scope.perJurisdictionConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perJurisdictionOptions = {
        color: colors,
        textStyle: {
          fontFamily: 'Lato',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Area-' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            data: _.map(categories, 'name'),
            axisTick: {
              alignWithLabel: true,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            type: 'bar',
            barWidth: '70%',
            label: {
              normal: {
                show: true,
              },
            },
            markPoint: {
              // show area with maximum and minimum
              data: [
                { name: 'Maximum', type: 'max' },
                { name: 'Minimum', type: 'min' },
              ],
            },
            markLine: {
              //add average line
              precision: 0,
              data: [{ type: 'average', name: 'Average' }],
            },
            data: data,
          },
        ],
      };
    };

    /**
     * prepare per jurisdiction per service group bar chart
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareIssuePerJurisdictionPerServiceGroup = function() {
      //prepare unique jurisdictions for bar chart categories
      var categories = _.chain($scope.standings)
        .map('jurisdiction')
        .sortBy('name')
        .map('name')
        .uniq()
        .value();

      //prepare unique group for bar chart series
      var groups = _.chain($scope.standings)
        .map('group')
        .uniqBy('name')
        .value();

      //prepare unique group color for bar chart and legends color
      var colors = _.map(groups, 'color');

      //prepare unique group name for bar chart legends label
      var legends = _.map(groups, 'name');

      //prepare bar chart series
      var series = {};
      _.forEach(categories, function(category) {
        _.forEach(groups, function(group) {
          var serie = series[group.name] || {
            name: group.name,
            type: 'bar',
            label: {
              normal: {
                show: true,
                position: 'top',
              },
            },
            data: [],
          };

          //obtain all standings of specified jurisdiction(category)
          //and group
          var value = _.filter($scope.standings, function(standing) {
            return (
              standing.jurisdiction.name === category &&
              standing.group.name === group.name
            );
          });
          value = value ? _.sumBy(value, 'count') : 0;
          serie.data.push({
            value: value,
            itemStyle: {
              normal: {
                color: group.color,
              },
            },
          });
          series[group.name] = serie;
        });
      });
      series = _.values(series);

      //prepare chart config
      $scope.perJurisdictionPerServiceGroupConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perJurisdictionPerServiceGroupOptions = {
        color: colors,
        textStyle: {
          fontFamily: 'Lato',
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{b} : {c}'
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: legends,
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Area Per Service Group-' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            data: categories,
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: series,
      };
    };

    /**
     * prepare per jurisdiction per service bar chart
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareIssuePerJurisdictionPerService = function() {
      //prepare unique jurisdictions for bar chart categories
      var categories = _.chain($scope.standings)
        .map('jurisdiction')
        .sortBy('name')
        .map('name')
        .uniq()
        .value();

      //prepare unique service for bar chart series
      var services = _.chain($scope.standings)
        .map('service')
        .uniqBy('name')
        .value();

      //prepare chart config
      $scope.perJurisdictionPerServiceConfig = {
        height: 400,
        forceClear: true,
      };
      //prepare chart options
      $scope.perJurisdictionPerServiceOptions = [];

      //chunk services for better charting display
      var chunks = _.chunk(services, 4);
      var chunksSize = _.size(chunks);
      _.forEach(chunks, function(_services, index) {
        //prepare unique service color for bar chart and legends color
        var colors = _.map(_services, 'color');

        //prepare unique service name for bar chart legends label
        var legends = _.map(_services, 'name');

        //prepare bar chart series
        var series = {};
        _.forEach(categories, function(category) {
          _.forEach(_services, function(service) {
            var serie = series[service.name] || {
              name: service.name,
              type: 'bar',
              label: {
                normal: {
                  show: true,
                  position: 'top',
                },
              },
              data: [],
            };

            //obtain all standings of specified jurisdiction(category)
            //and service
            var value = _.filter($scope.standings, function(standing) {
              return (
                standing.jurisdiction.name === category &&
                standing.service.name === service.name
              );
            });
            value = value ? _.sumBy(value, 'count') : 0;
            serie.data.push({
              value: value,
              itemStyle: {
                normal: {
                  color: service.color,
                },
              },
            });
            series[service.name] = serie;
          });
        });
        series = _.values(series);

        //ensure bottom margin for top charts
        var chart =
          index === chunksSize - 1
            ? {}
            : {
                grid: {
                  bottom: '30%',
                },
              };

        //prepare chart options
        $scope.perJurisdictionPerServiceOptions.push(
          _.merge(chart, {
            color: colors,
            textStyle: {
              fontFamily: 'Lato',
            },
            tooltip: {
              trigger: 'item',
              // formatter: '{b} : {c}'
            },
            legend: {
              orient: 'horizontal',
              x: 'center',
              y: 'top',
              data: legends,
            },
            toolbox: {
              show: true,
              feature: {
                saveAsImage: {
                  name: 'Issue per Area Per Service-' + new Date().getTime(),
                  title: 'Save',
                  show: true,
                },
              },
            },
            calculable: true,
            xAxis: [
              {
                type: 'category',
                data: categories,
              },
            ],
            yAxis: [
              {
                type: 'value',
              },
            ],
            series: series,
          })
        );
      });
    };

    /**
     * prepare per jurisdiction per status bar chart
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareIssuePerJurisdictionPerStatus = function() {
      //prepare unique jurisdictions for bar chart categories
      var categories = _.chain($scope.standings)
        .map('jurisdiction')
        .sortBy('name')
        .map('name')
        .uniq()
        .value();

      //prepare unique status for bar chart series
      var statuses = _.chain($scope.standings)
        .map('status')
        .sortBy('weight')
        .uniqBy('name')
        .value();

      //prepare unique status color for bar chart and legends color
      var colors = _.map(statuses, 'color');

      //prepare unique status name for bar chart legends label
      var legends = _.map(statuses, 'name');

      //prepare bar chart series
      var series = {};
      _.forEach(categories, function(category) {
        _.forEach(statuses, function(status) {
          var serie = series[status.name] || {
            name: status.name,
            type: 'bar',
            label: {
              normal: {
                show: true,
                position: 'top',
              },
            },
            data: [],
          };

          //obtain all standings of specified jurisdiction(category)
          //and status
          var value = _.filter($scope.standings, function(standing) {
            return (
              standing.jurisdiction.name === category &&
              standing.status.name === status.name
            );
          });
          value = value ? _.sumBy(value, 'count') : 0;
          serie.data.push({
            value: value,
            itemStyle: {
              normal: {
                color: status.color,
              },
            },
          });
          series[status.name] = serie;
        });
      });
      series = _.values(series);

      //prepare chart config
      $scope.perJurisdictionPerStatusConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perJurisdictionPerStatusOptions = {
        color: colors,
        textStyle: {
          fontFamily: 'Lato',
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{b} : {c}'
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: legends,
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Area Per Status-' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            data: categories,
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: series,
      };
    };

    /**
     * prepare per jurisdiction per priority bar chart
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareIssuePerJurisdictionPerPriority = function() {
      //prepare unique jurisdictions for bar chart categories
      var categories = _.chain($scope.standings)
        .map('jurisdiction')
        .sortBy('name')
        .map('name')
        .uniq()
        .value();

      //prepare unique priority for bar chart series
      var prioroties = _.chain($scope.standings)
        .map('priority')
        .sortBy('weight')
        .uniqBy('name')
        .value();

      //prepare unique priority color for bar chart and legends color
      var colors = _.map(prioroties, 'color');

      //prepare unique priority name for bar chart legends label
      var legends = _.map(prioroties, 'name');

      //prepare bar chart series
      var series = {};
      _.forEach(categories, function(category) {
        _.forEach(prioroties, function(priority) {
          var serie = series[priority.name] || {
            name: priority.name,
            type: 'bar',
            label: {
              normal: {
                show: true,
                position: 'top',
              },
            },
            data: [],
          };

          //obtain all standings of specified jurisdiction(category)
          //and priority
          var value = _.filter($scope.standings, function(standing) {
            return (
              standing.jurisdiction.name === category &&
              standing.priority.name === priority.name
            );
          });
          value = value ? _.sumBy(value, 'count') : 0;
          serie.data.push({
            value: value,
            itemStyle: {
              normal: {
                color: priority.color,
              },
            },
          });
          series[priority.name] = serie;
        });
      });
      series = _.values(series);

      //prepare chart config
      $scope.perJurisdictionPerPriorityConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perJurisdictionPerPriorityOptions = {
        color: colors,
        textStyle: {
          fontFamily: 'Lato',
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{b} : {c}'
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: legends,
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Area Per Priority-' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            data: categories,
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: series,
      };
    };

    /**
     * Reload standing reports
     */
    $scope.reload = function() {
      Summary.standings({ filter: $scope.params }).then(function(standings) {
        $scope.standings = standings;
        $scope.prepare();
      });
    };

    //listen for events and reload overview accordingly
    $rootScope.$on('app:servicerequests:reload', function() {
      $scope.reload();
    });

    //pre-load reports
    //prepare overview details
    $scope.params = Summary.prepareQuery($scope.filters);
    $scope.reload();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:DashboardExportCtrl
 * @description
 * # DashboardExportCtrl
 * dashboard service requesr bulk export controller of ng311
 */
angular
  .module('ng311')
  .controller('DashboardExportCtrl', function(
    $window,
    $location,
    $rootScope,
    $scope,
    $state,
    Utils,
    Summary,
    endpoints,
    token,
    party
  ) {
    //initialize scope attributes
    $scope.maxDate = new Date();

    //bind states
    $scope.priorities = endpoints.priorities.priorities;
    $scope.statuses = endpoints.statuses.statuses;
    $scope.services = endpoints.services.services;
    $scope.servicegroups = endpoints.servicegroups.servicegroups;
    $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;
    $scope.workspaces = party.settings.party.relation.workspaces;

    //bind filters
    var defaultFilters = {
      startedAt: moment()
        .utc()
        .startOf('date')
        .toDate(),
      endedAt: moment()
        .utc()
        .endOf('date')
        .toDate(),
      statuses: [],
      priorities: [],
      servicegroups: [],
      jurisdictions: [],
      workspaces: [],
    };

    $scope.filters = defaultFilters;

    /**
     * Filter overview reports based on on current selected filters
     * @param {Boolean} [reset] whether to clear and reset filter
     */
    $scope.export = function(reset) {
      if (reset) {
        $scope.filters = defaultFilters;
        return;
      } else {
        //prepare query
        $scope.params = Summary.prepareQuery($scope.filters);

        //load reports
        $scope.download();
      }
    };

    /**
     * Filter service based on selected service group
     */
    $scope.filterServices = function() {
      var filterHasServiceGroups =
        $scope.filters.servicegroups && $scope.filters.servicegroups.length > 0;
      //pick only service of selected group
      if (filterHasServiceGroups) {
        //filter services based on service group(s)
        $scope.services = _.filter(endpoints.services.services, function(
          service
        ) {
          return _.includes($scope.filters.servicegroups, service.group._id);
        });
      }
      //use all services
      else {
        $scope.services = endpoints.services.services;
      }
    };

    /**
     * download service requests
     */
    $scope.download = function() {
      var link = Utils.asLink(['reports', 'exports']);
      link = link + '?filter=' + angular.toJson($scope.params);
      link = link + '&token=' + token;
      $window.open(link, '_blank');
    };
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:DashboardPerformanceCtrl
 * @description
 * # DashboardPerformanceCtrl
 * dashboard performance controller of ng311
 */

angular
  .module('ng311')
  .controller('DashboardPerformanceCtrl', function(
    $rootScope,
    $scope,
    $state,
    $filter,
    $stateParams,
    $uibModal,
    Summary,
    endpoints,
    party
  ) {
    //initialize scope attributes
    $scope.maxDate = new Date();

    //bind states
    $scope.priorities = endpoints.priorities.priorities;
    $scope.statuses = endpoints.statuses.statuses;
    $scope.services = endpoints.services.services;
    $scope.servicegroups = endpoints.servicegroups.servicegroups;
    $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;
    $scope.workspaces = party.settings.party.relation.workspaces;

    //set default jurisdiction
    $scope.jurisdiction =
      $stateParams.jurisdiction || _.first($scope.jurisdictions);

    //bind filters
    var defaultFilters = {
      startedAt:
        $stateParams.startedAt ||
        moment()
          .utc()
          .startOf('date')
          .toDate(),
      endedAt:
        $stateParams.endedAt ||
        moment()
          .utc()
          .endOf('date')
          .toDate(),
      jurisdictions: $scope.jurisdiction._id,
      workspaces: [],
    };

    //TODO persist filter to local storage
    $scope.filters = defaultFilters;

    //initialize performances
    $scope.performances = {};

    /**
     * Open performance reports filter
     */
    $scope.showFilter = function() {
      //open performance reports filter modal
      $scope.modal = $uibModal.open({
        templateUrl: 'views/dashboards/_partials/performances_filter.html',
        scope: $scope,
        size: 'lg',
      });

      //handle modal close and dismissed
      $scope.modal.result.then(
        function onClose(/*selectedItem*/) {},
        function onDismissed() {}
      );
    };

    /**
     * Filter performance reports based on on current selected filters
     * @param {Boolean} [reset] whether to clear and reset filter
     */
    $scope.filter = function(reset) {
      if (reset) {
        $scope.filters = defaultFilters;
      }

      //prepare query
      $scope.params = Summary.prepareQuery($scope.filters);

      //reset area
      var _id = $scope.filters.jurisdictions;
      $scope.jurisdiction = _.find($scope.jurisdictions, {
        _id: _id,
      });

      //load reports
      $scope.reload();

      //close current modal
      $scope.modal.close();
    };

    //prepare summaries
    //TODO make api to return data
    $scope.prepareSummaries = function() {
      //prepare summary
      $scope.performances.summaries = [
        {
          name: 'Resolved',
          count: _.get($scope.performances, 'overall.resolved', 0),
          color: '#8BC34A',
        },
        {
          name: 'Pending',
          count: _.get($scope.performances, 'overall.pending', 0),
          color: '#00BCD4',
        },
        {
          name: 'Late',
          count: _.get($scope.performances, 'overall.late', 0),
          color: '#009688',
        },
      ];
    };

    $scope.prepare = function() {
      //shaping data
      $scope.prepareSummaries();

      // prepare percentages for overall summary
      $scope.prepareOverallPercentages();

      //prepare visualization
      $scope.prepareSummaryVisualization();
      $scope.prepareStatusesVisualization();
      $scope.prepareServiceGroupVisualization();
      $scope.prepareServiceVisualization();
    };

    /**
     * Reload performance reports
     */
    $scope.reload = function() {
      Summary.performances({
        filter: $scope.params,
      }).then(function(performances) {
        $scope.performances = performances;

        //ensure performances loaded
        if ($scope.performances) {
          //ensure status are sorted by weight
          $scope.performances.statuses = _.orderBy(
            performances.statuses,
            'weight',
            'asc'
          );

          $scope.prepare();
        }
      });
    };

    /**
     * prepare percentages for pending,resolved and late service requests in respect to total
     * service requests
     * @version 0.1.0
     * @since 0.1.0
     * @author Benson Maruchu<benmaruchu@gmail.com>
     */
    $scope.prepareOverallPercentages = function() {
      var overallExists = _.get($scope.performances, 'overall', false);

      // check if overall data exists
      if (overallExists) {
        var percentages = {
          percentageResolved:
            ($scope.performances.overall.resolved /
              $scope.performances.overall.count) *
            100,
          percentagePending:
            ($scope.performances.overall.pending /
              $scope.performances.overall.count) *
            100,
          percentageLate:
            ($scope.performances.overall.late /
              $scope.performances.overall.count) *
            100,
        };

        $scope.performances.overall = _.merge(
          {},
          $scope.performances.overall,
          percentages
        );
      }
    };

    /**
     * prepare summary visualization
     * @return {object} echart donut chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareSummaryVisualization = function() {
      //prepare chart series data
      var data = _.map($scope.performances.summaries, function(summary) {
        return {
          name: summary.name,
          value: summary.count,
        };
      });

      //prepare chart config
      $scope.perSummaryConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perSummaryOptions = {
        textStyle: {
          fontFamily: 'Lato',
        },
        title: {
          text: 'Total',
          subtext: $filter('number')(_.sumBy(data, 'value'), 0),
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: '{b}:<br/> Count: {c} <br/> Percent: ({d}%)',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Area Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        series: [
          {
            type: 'pie',
            selectedMode: 'single',
            radius: ['45%', '55%'],
            color: _.map($scope.performances.summaries, 'color'),
            label: {
              normal: {
                formatter: '{b}\n{d}%\n( {c} )',
              },
            },
            data: data,
          },
        ],
      };
    };

    /**
     * prepare statuses visualization
     * @return {object} echart donut chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareStatusesVisualization = function() {
      //prepare chart series data
      var data = _.map($scope.performances.statuses, function(status) {
        return {
          name: status.name,
          value: status.count,
        };
      });

      //prepare chart config
      $scope.perStatusesConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perStatusesOptions = {
        textStyle: {
          fontFamily: 'Lato',
        },
        title: {
          text: 'Total',
          subtext: $filter('number')(_.sumBy(data, 'value'), 0),
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: '{b}:<br/> Count: {c} <br/> Percent: ({d}%)',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Area Status Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        series: [
          {
            type: 'pie',
            selectedMode: 'single',
            radius: ['45%', '55%'],
            color: _.map($scope.performances.statuses, 'color'),
            label: {
              normal: {
                formatter: '{b}\n{d}%\n( {c} )',
              },
            },
            data: data,
          },
        ],
      };
    };

    /**
     * prepare service group performance visualization
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareServiceGroupVisualization = function(column) {
      //ensure column
      column = column || 'count';

      //prepare chart series data
      var data = _.map($scope.performances.groups, function(group) {
        return {
          name: group.name,
          value: group[column],
        };
      });

      //prepare chart config
      $scope.perServiceGroupConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perServiceGroupOptions = {
        textStyle: {
          fontFamily: 'Lato',
        },
        title: {
          text:
            column === 'count' ? 'Total' : _.upperFirst(column.toLowerCase()),
          subtext: $filter('number')(_.sumBy(data, 'value'), 0),
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: '{b}:<br/> Count: {c} <br/> Percent: ({d}%)',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Service Groups Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        series: [
          {
            type: 'pie',
            selectedMode: 'single',
            radius: ['45%', '55%'],
            color: _.map($scope.performances.groups, 'color'),

            label: {
              normal: {
                formatter: '{b}\n{d}%\n( {c} )',
              },
            },
            data: data,
          },
        ],
      };
    };

    /**
     * prepare per service bar chart
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareServiceVisualization = function(column) {
      //ensure column
      column = column || 'count';

      //prepare unique services for bar chart categories
      var categories = _.chain($scope.performances)
        .map('services')
        .uniqBy('name')
        .value();

      //prepare bar chart series data
      var data = _.map($scope.performances.services, function(service) {
        var serie = {
          name: service.name,
          value: service[column],
          itemStyle: {
            normal: {
              color: service.color,
            },
          },
        };

        return serie;
      });

      //sort data by their value
      data = _.orderBy(data, 'value', 'asc');

      //prepare chart config
      $scope.perServiceConfig = {
        height: '1100',
        forceClear: true,
      };

      //prepare chart options
      $scope.perServiceOptions = {
        color: _.map(data, 'itemStyle.normal.color'),
        textStyle: {
          fontFamily: 'Lato',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Area Services Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        calculable: true,
        yAxis: [
          {
            type: 'category',
            data: _.map(data, 'name'),
            boundaryGap: true,
            axisTick: {
              alignWithLabel: true,
            },
            axisLabel: {
              rotate: 60,
            },
            axisLine: {
              show: true,
            },
          },
        ],
        xAxis: [
          {
            type: 'value',
            scale: true,
            position: 'top',
            boundaryGap: true,
            axisTick: {
              show: false,
              lineStyle: {
                color: '#ddd',
              },
            },
            splitLine: {
              show: false,
            },
          },
        ],
        series: [
          {
            type: 'bar',
            barWidth: '55%',
            label: {
              normal: {
                show: true,
                position: 'right',
              },
            },
            data: data,
          },
        ],
      };
    };

    //listen for events and reload performance accordingly
    $rootScope.$on('app:servicerequests:reload', function() {
      $scope.reload();
    });

    //pre-load reports
    //prepare performance details
    $scope.params = Summary.prepareQuery($scope.filters);
    $scope.reload();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:DashboardPerformanceCtrl
 * @description
 * # DashboardPerformanceCtrl
 * dashboard performance controller of ng311
 */

angular
  .module('ng311')
  .controller('DashboardOperationCtrl', function(
    $rootScope,
    $scope,
    $state,
    $filter,
    $stateParams,
    $uibModal,
    Summary,
    endpoints,
    party
  ) {
    //initialize scope attributes
    $scope.maxDate = new Date();

    //bind states
    $scope.priorities = endpoints.priorities.priorities;
    $scope.statuses = endpoints.statuses.statuses;
    $scope.services = endpoints.services.services;
    $scope.servicegroups = endpoints.servicegroups.servicegroups;
    $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;
    $scope.workspaces = party.settings.party.relation.workspaces;
    $scope.materials = [
      { name: 'Adaptor Flange 10’’ PVC', quantity: 1 },
      { name: 'Adaptor Flange 10’’ GS', quantity: 1 },
      { name: 'Adaptor Flange 12’’ GS', quantity: 1 },
      { name: 'Adaptor Flange 12’’ PVC', quantity: 1 },
      { name: 'Adaptor Flange 3’’ GS', quantity: 1 },
      { name: 'Adaptor Flange 3’’ PVC', quantity: 1 },
      { name: 'Adaptor Flange 4’’ GS', quantity: 1 },
      { name: 'Adaptor Flange 4’’ PVC', quantity: 1 },
      { name: 'Adaptor Flange 6’’ GS', quantity: 1 },
      { name: 'Adaptor Flange 6’’ PVC', quantity: 1 },
      { name: 'Adaptor Flange 8’’ GS', quantity: 1 },
      { name: 'Adaptor Flange 8’’ PVC', quantity: 1 },
      { name: 'Air Valve 1" Double Acting (GS)', quantity: 1 },
      { name: 'Air Valve 1" Single Acting (GS)', quantity: 1 },
      { name: 'Air Valve 2"Double Acting (GS)', quantity: 1 },
      { name: 'Air Valve 2"Single Acting (GS)', quantity: 1 },
      { name: 'Air Valve 3"Double Acting (GS)', quantity: 1 },
      { name: 'Air Valve 3"Single Acting (GS)', quantity: 1 },
    ];
    $scope.zones = [
      {
        name: 'Zone A',
        total: 10,
        inProgress: 4,
        done: 2,
        verified: 2,
        closed: 2,
        late: 0,
      },
      {
        name: 'Zone B',
        total: 10,
        inProgress: 4,
        done: 2,
        verified: 2,
        closed: 2,
        late: 0,
      },
      {
        name: 'Zone C',
        total: 10,
        inProgress: 4,
        done: 2,
        verified: 2,
        closed: 2,
        late: 0,
      },
      {
        name: 'Zone D',
        total: 10,
        inProgress: 4,
        done: 2,
        verified: 2,
        closed: 2,
        late: 0,
      },
    ];

    //set default jurisdiction
    $scope.jurisdiction =
      $stateParams.jurisdiction || _.first($scope.jurisdictions);

    //bind filters
    var defaultFilters = {
      startedAt:
        $stateParams.startedAt ||
        moment()
          .utc()
          .startOf('date')
          .toDate(),
      endedAt:
        $stateParams.endedAt ||
        moment()
          .utc()
          .endOf('date')
          .toDate(),
      jurisdictions: $scope.jurisdiction._id,
      workspaces: [],
    };

    //TODO persist filter to local storage
    $scope.filters = defaultFilters;

    //initialize performances
    $scope.performances = {};

    /**
     * Open performance reports filter
     */
    $scope.showFilter = function() {
      //open performance reports filter modal
      $scope.modal = $uibModal.open({
        templateUrl: 'views/dashboards/_partials/performances_filter.html',
        scope: $scope,
        size: 'lg',
      });

      //handle modal close and dismissed
      $scope.modal.result.then(
        function onClose(/*selectedItem*/) {},
        function onDismissed() {}
      );
    };

    /**
     * Filter performance reports based on on current selected filters
     * @param {Boolean} [reset] whether to clear and reset filter
     */
    $scope.filter = function(reset) {
      if (reset) {
        $scope.filters = defaultFilters;
      }

      //prepare query
      $scope.params = Summary.prepareQuery($scope.filters);

      //reset area
      var _id = $scope.filters.jurisdictions;
      $scope.jurisdiction = _.find($scope.jurisdictions, {
        _id: _id,
      });

      //load reports
      $scope.reload();

      //close current modal
      $scope.modal.close();
    };

    //prepare summaries
    //TODO make api to return data
    $scope.prepareSummaries = function() {
      //prepare summary
      $scope.performances.summaries = [
        {
          name: 'Resolved',
          count: _.get($scope.performances, 'overall.resolved', 0),
          color: '#8BC34A',
        },
        {
          name: 'Pending',
          count: _.get($scope.performances, 'overall.pending', 0),
          color: '#00BCD4',
        },
        {
          name: 'Late',
          count: _.get($scope.performances, 'overall.late', 0),
          color: '#009688',
        },
      ];
    };

    $scope.prepare = function() {
      //shaping data
      $scope.prepareSummaries();

      // prepare percentages for overall summary
      $scope.prepareOverallPercentages();

      //prepare visualization
      $scope.prepareSummaryVisualization();
      $scope.prepareStatusesVisualization();
      $scope.prepareServiceGroupVisualization();
      $scope.prepareServiceVisualization();
    };

    /**
     * Reload performance reports
     */
    $scope.reload = function() {
      Summary.performances({
        filter: $scope.params,
      }).then(function(performances) {
        $scope.performances = performances;

        //ensure performances loaded
        if ($scope.performances) {
          //ensure status are sorted by weight
          $scope.performances.statuses = _.orderBy(
            performances.statuses,
            'weight',
            'asc'
          );

          $scope.prepare();
        }
      });
    };

    /**
     * prepare percentages for pending,resolved and late service requests in respect to total
     * service requests
     * @version 0.1.0
     * @since 0.1.0
     * @author Benson Maruchu<benmaruchu@gmail.com>
     */
    $scope.prepareOverallPercentages = function() {
      var overallExists = _.get($scope.performances, 'overall', false);

      // check if overall data exists
      if (overallExists) {
        var percentages = {
          percentageResolved:
            ($scope.performances.overall.resolved /
              $scope.performances.overall.count) *
            100,
          percentagePending:
            ($scope.performances.overall.pending /
              $scope.performances.overall.count) *
            100,
          percentageLate:
            ($scope.performances.overall.late /
              $scope.performances.overall.count) *
            100,
        };

        $scope.performances.overall = _.merge(
          {},
          $scope.performances.overall,
          percentages
        );
      }
    };

    /**
     * prepare summary visualization
     * @return {object} echart donut chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareSummaryVisualization = function() {
      //prepare chart series data
      var data = _.map($scope.performances.summaries, function(summary) {
        return {
          name: summary.name,
          value: summary.count,
        };
      });

      //prepare chart config
      $scope.perSummaryConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perSummaryOptions = {
        textStyle: {
          fontFamily: 'Lato',
        },
        title: {
          text: 'Total',
          subtext: $filter('number')(_.sumBy(data, 'value'), 0),
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: '{b}:<br/> Count: {c} <br/> Percent: ({d}%)',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Area Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        series: [
          {
            type: 'pie',
            selectedMode: 'single',
            radius: ['45%', '55%'],
            color: _.map($scope.performances.summaries, 'color'),
            label: {
              normal: {
                formatter: '{b}\n{d}%\n( {c} )',
              },
            },
            data: data,
          },
        ],
      };
    };

    /**
     * prepare statuses visualization
     * @return {object} echart donut chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareStatusesVisualization = function() {
      //prepare chart series data
      var data = _.map($scope.performances.statuses, function(status) {
        return {
          name: status.name,
          value: status.count,
        };
      });

      //prepare chart config
      $scope.perStatusesConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perStatusesOptions = {
        textStyle: {
          fontFamily: 'Lato',
        },
        title: {
          text: 'Total',
          subtext: $filter('number')(_.sumBy(data, 'value'), 0),
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: '{b}:<br/> Count: {c} <br/> Percent: ({d}%)',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Area Status Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        series: [
          {
            type: 'pie',
            selectedMode: 'single',
            radius: ['45%', '55%'],
            color: _.map($scope.performances.statuses, 'color'),
            label: {
              normal: {
                formatter: '{b}\n{d}%\n( {c} )',
              },
            },
            data: data,
          },
        ],
      };
    };

    /**
     * prepare service group performance visualization
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareServiceGroupVisualization = function(column) {
      //ensure column
      column = column || 'count';

      //prepare chart series data
      var data = _.map($scope.performances.groups, function(group) {
        return {
          name: group.name,
          value: group[column],
        };
      });

      //prepare chart config
      $scope.perServiceGroupConfig = {
        height: 400,
        forceClear: true,
      };

      //prepare chart options
      $scope.perServiceGroupOptions = {
        textStyle: {
          fontFamily: 'Lato',
        },
        title: {
          text:
            column === 'count' ? 'Total' : _.upperFirst(column.toLowerCase()),
          subtext: $filter('number')(_.sumBy(data, 'value'), 0),
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: '{b}:<br/> Count: {c} <br/> Percent: ({d}%)',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Service Groups Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        series: [
          {
            type: 'pie',
            selectedMode: 'single',
            radius: ['45%', '55%'],
            color: _.map($scope.performances.groups, 'color'),

            label: {
              normal: {
                formatter: '{b}\n{d}%\n( {c} )',
              },
            },
            data: data,
          },
        ],
      };
    };

    /**
     * prepare per service bar chart
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareServiceVisualization = function(column) {
      //ensure column
      column = column || 'count';

      //prepare unique services for bar chart categories
      var categories = _.chain($scope.performances)
        .map('services')
        .uniqBy('name')
        .value();

      //prepare bar chart series data
      var data = _.map($scope.performances.services, function(service) {
        var serie = {
          name: service.name,
          value: service[column],
          itemStyle: {
            normal: {
              color: service.color,
            },
          },
        };

        return serie;
      });

      //sort data by their value
      data = _.orderBy(data, 'value', 'asc');

      //prepare chart config
      $scope.perServiceConfig = {
        height: '1100',
        forceClear: true,
      };

      //prepare chart options
      $scope.perServiceOptions = {
        color: _.map(data, 'itemStyle.normal.color'),
        textStyle: {
          fontFamily: 'Lato',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Area Services Overview - ' + new Date().getTime(),
              title: 'Save',
              show: true,
            },
          },
        },
        calculable: true,
        yAxis: [
          {
            type: 'category',
            data: _.map(data, 'name'),
            boundaryGap: true,
            axisTick: {
              alignWithLabel: true,
            },
            axisLabel: {
              rotate: 60,
            },
            axisLine: {
              show: true,
            },
          },
        ],
        xAxis: [
          {
            type: 'value',
            scale: true,
            position: 'top',
            boundaryGap: true,
            axisTick: {
              show: false,
              lineStyle: {
                color: '#ddd',
              },
            },
            splitLine: {
              show: false,
            },
          },
        ],
        series: [
          {
            type: 'bar',
            barWidth: '55%',
            label: {
              normal: {
                show: true,
                position: 'right',
              },
            },
            data: data,
          },
        ],
      };
    };

    //listen for events and reload performance accordingly
    $rootScope.$on('app:servicerequests:reload', function() {
      $scope.reload();
    });

    //pre-load reports
    //prepare performance details
    $scope.params = Summary.prepareQuery($scope.filters);
    $scope.reload();
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:DashboardComparisonCtrl
 * @description
 * # DashboardComparisonCtrl
 * dashboard daily comparison controller of ng311
 */

angular
  .module('ng311')
  .controller('DashboardComparisonCtrl', function($scope, Summary) {
    $scope.reload = function() {
      Summary.standings().then(function(standings) {
        $scope.standings = standings;

        $scope.prepare();
      });
    };

    // prepare standing report data in a preferable format
    $scope.prepare = function() {
      $scope.statuses = _.chain($scope.standings)
        .map('status')
        .uniqBy('name')
        .sortBy('weight')
        .value();

      // service groups
      $scope.groups = _.chain($scope.standings)
        .map('group')
        .uniqBy('name')
        .sortBy('name')
        .value();

      $scope.prepareAreaPerStatus();
      $scope.prepareAreaPerServiceGroup();
      $scope.prepareAreaPerService();
      $scope.prepareServicePerStatus();
      $scope.prepareServiceGroupPerStatus();
    };

    // TODO document this function
    $scope.prepareAreaPerStatus = function() {
      var areas = _.chain($scope.standings)
        .map('jurisdiction')
        .uniqBy('name')
        .sortBy('name')
        .value();

      // data which will be displayed
      var data = [];
      _.forEach(areas, function(area) {
        var jurisdiction = {};
        jurisdiction.total = 0;
        jurisdiction.statuses = [];
        _.forEach($scope.statuses, function(status) {
          // filter all data from same jurisdiction and with the same status name
          var value = _.filter($scope.standings, function(standing) {
            return (
              standing.jurisdiction.name === area.name &&
              standing.status.name === status.name
            );
          });

          value = value ? _.sumBy(value, 'count') : 0;

          status = _.merge({}, status, {
            count: value,
          });

          jurisdiction.total += value;
          // add array of statuses into jurisdiction data object
          jurisdiction.statuses.push(status);
        });

        jurisdiction.statuses = _.sortBy(jurisdiction.statuses, 'weight');

        jurisdiction.name = area.name;

        data.push(jurisdiction);
      });

      // create last Row which is the summation of all areas based on statuses
      var lastRow = {};
      lastRow.name = 'Total';
      lastRow.statuses = [];
      lastRow.total = 0;

      _.forEach($scope.statuses, function(status) {
        // filter all data from same jurisdiction and with the same status name
        var value = _.filter($scope.standings, function(standing) {
          return standing.status.name === status.name;
        });

        value = value ? _.sumBy(value, 'count') : 0;

        lastRow.total += value;

        status = _.merge({}, status, {
          count: value,
        });

        lastRow.statuses.push(status);
      });

      data.push(lastRow);

      $scope.areaPerStatus = data;
    };

    // TODO document this function
    $scope.preparePipeline = function() {
      var data = [];
      var total = 0;

      _.forEach($scope.statuses, function(status) {
        // filter all data from same jurisdiction and with the same status name
        var value = _.filter($scope.standings, function(standing) {
          return standing.status.name === status.name;
        });

        value = value ? _.sumBy(value, 'count') : 0;

        total += value;

        status = _.merge({}, status, {
          count: value,
        });

        data.push(status);
      });
    };

    //TODO document this function
    $scope.prepareAreaPerServiceGroup = function() {
      var areas = _.chain($scope.standings)
        .map('jurisdiction')
        .uniqBy('name')
        .sortBy('name')
        .value();

      var data = [];

      _.forEach(areas, function(area) {
        var jurisdiction = {};
        jurisdiction.name = area.name;
        jurisdiction.groups = [];
        jurisdiction.total = 0;
        _.forEach($scope.groups, function(group) {
          var value = _.filter($scope.standings, function(standing) {
            return (
              standing.jurisdiction.name === area.name &&
              standing.group.name === group.name
            );
          });

          value = value ? _.sumBy(value, 'count') : 0;

          group = _.merge({}, group, {
            count: value,
          });

          jurisdiction.groups.push(group);

          jurisdiction.total += value;
        });

        data.push(jurisdiction);
      });

      // prepare last Row
      var lastRow = {};
      lastRow.name = 'Total';
      lastRow.groups = [];
      lastRow.total = 0;

      _.forEach($scope.groups, function(group) {
        var value = _.filter($scope.standings, function(standing) {
          return standing.group.name === group.name;
        });

        value = value ? _.sumBy(value, 'count') : 0;

        group = _.merge({}, group, {
          count: value,
        });

        lastRow.groups.push(group);

        lastRow.total += value;
      });

      data.push(lastRow);

      $scope.areaPerServiceGroup = data;
    };

    // TODO document this function
    $scope.prepareAreaPerService = function() {
      $scope.areas = _.chain($scope.standings)
        .map('jurisdiction')
        .uniqBy('name')
        .sortBy('name')
        .value();

      var services = _.chain($scope.standings)
        .map('service')
        .uniqBy('name')
        .sortBy('name')
        .value();

      var data = [];

      _.forEach(services, function(service) {
        var serviceObject = {};
        serviceObject.name = service.name;
        serviceObject.areas = [];
        serviceObject.total = 0;
        _.forEach($scope.areas, function(area) {
          var value = _.filter($scope.standings, function(standing) {
            return (
              standing.service.name === service.name &&
              standing.jurisdiction.name === area.name
            );
          });

          value = value ? _.sumBy(value, 'count') : 0;

          serviceObject.total += value;

          area = _.merge({}, area, {
            count: value,
          });

          serviceObject.areas.push(area);
        });

        data.push(serviceObject);
      });

      var lastRow = {};
      lastRow.name = 'Total';
      lastRow.areas = [];
      lastRow.total = 0;
      // prepare the last row which is the summation of each column
      _.forEach($scope.areas, function(area) {
        var value = _.filter($scope.standings, function(standing) {
          return standing.jurisdiction.name === area.name;
        });

        value = value ? _.sumBy(value, 'count') : 0;

        lastRow.total += value;

        area = _.merge({}, area, {
          count: value,
        });

        lastRow.areas.push(area);
      });

      data.push(lastRow);

      $scope.areaPerService = data;
    };

    // TODO document this function
    $scope.prepareServicePerStatus = function() {
      var services = _.chain($scope.standings)
        .map('service')
        .uniqBy('name')
        .sortBy('name')
        .value();

      var data = [];
      _.forEach(services, function(service) {
        var serviceObject = {};
        serviceObject.name = service.name;
        serviceObject.total = 0;
        serviceObject.statuses = [];

        _.forEach($scope.statuses, function(status) {
          var value = _.filter($scope.standings, function(standing) {
            return (
              standing.service.name === service.name &&
              standing.status.name === status.name
            );
          });

          value = value ? _.sumBy(value, 'count') : 0;

          status = _.merge({}, status, {
            count: value,
          });

          serviceObject.statuses.push(status);

          serviceObject.total += value;
        });

        data.push(serviceObject);
      });

      var lastRow = {};
      lastRow.name = 'Total';
      lastRow.total = 0;
      lastRow.statuses = [];

      _.forEach($scope.statuses, function(status) {
        var value = _.filter($scope.standings, function(standing) {
          return standing.status.name === status.name;
        });

        value = value ? _.sumBy(value, 'count') : 0;

        status = _.merge({}, status, {
          count: value,
        });

        lastRow.statuses.push(status);

        lastRow.total += value;
      });

      data.push(lastRow);

      $scope.servicePerStatus = data;
    };

    $scope.prepareServiceGroupPerStatus = function() {
      // service groups
      var groups = _.chain($scope.standings)
        .map('group')
        .uniqBy('name')
        .sortBy('name')
        .value();

      var data = [];

      _.forEach(groups, function(group) {
        var groupObject = {};
        groupObject.name = group.name;
        groupObject.statuses = [];
        groupObject.total = 0;
        _.forEach($scope.statuses, function(status) {
          var value = _.filter($scope.standings, function(standing) {
            return (
              standing.group.name === group.name &&
              standing.status.name === status.name
            );
          });

          value = value ? _.sumBy(value, 'count') : 0;

          status = _.merge({}, status, {
            count: value,
          });

          groupObject.statuses.push(status);

          groupObject.total += value;
        });
        data.push(groupObject);
      });

      // prepare the last Row
      var lastRow = {};
      lastRow.total = 0;
      lastRow.name = 'Total';
      lastRow.statuses = [];

      _.forEach($scope.statuses, function(status) {
        var value = _.filter($scope.standings, function(standing) {
          return standing.status.name === status.name;
        });

        value = value ? _.sumBy(value, 'count') : 0;

        status = _.merge({}, status, {
          count: value,
        });

        lastRow.statuses.push(status);

        lastRow.total += value;
      });

      data.push(lastRow);

      $scope.serviceGroupPerStatus = data;
    };

    // dummy data
    $scope.pipelines = [
      {
        count: 17,
        label: {
          name: 'Total',
        },
        displayColor: '#4BC0C0',
      },
      {
        count: 7,
        label: {
          name: 'Open',
        },
        displayColor: '#0D47A1',
      },
      {
        count: 5,
        label: {
          name: 'In Progress',
        },
        displayColor: '#1B5E20',
      },
      {
        count: 5,
        label: {
          name: 'Escallated',
        },
        displayColor: '#EF6C00',
      },
      {
        count: 5,
        label: {
          name: 'Closed',
        },
        displayColor: '#1B5E20',
      },
    ];

    // reload standing data
    $scope.reload();
  });

angular.module('ng311').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/_partials/aside.html',
    " <div class=\"navside\" data-layout=\"column\"> <div class=\"navbar no-radius\"> <a title=\"{{ ENV.title }} | {{ ENV.description }}\" ui-sref=\"app.servicerequests.list\" class=\"navbar-brand\"> <img src=\"images/logo_sm.f2b373cb.png\" alt=\".\" width=\"48\" class=\"m-t-sm\"> </a> </div> <br> <div data-flex class=\"hide-scroll\"> <nav class=\"scroll nav-stacked nav-stacked-rounded nav-color\"> <ul class=\"nav\" data-ui-nav> <li class=\"nav-header hidden-folded\"> <span class=\"text-xs\">Main</span> </li> <li ui-sref-active=\"active\" show-if-has-any-permit=\"servicerequest:create, servicerequest:view\"> <a ui-sref=\"app.servicerequests.list\" title=\"Issues & Service Request\"> <span class=\"nav-icon\"> <i class=\"ion-chatbubble-working\"></i> </span> <span class=\"nav-text\">Issues</span> </a> </li> <li ui-sref-active=\"active\" show-if-has-any-permit=\"servicerequest:create, servicerequest:edit\"> <a ui-sref=\"app.create_servicerequests\" ui-sref-opts=\"{reload: true}\" title=\"Report New Issue or Service Request\"> <span class=\"nav-icon\"> <i class=\"ion-plus-circled\"></i> </span> <span class=\"nav-text\">New Issue</span> </a> </li> <li ui-sref-active=\"active\" show-if-has-any-permit=\"alert:create, alert:view\"> <a ui-sref=\"app.alerts\" ui-sref-opts=\"{reload: true}\" title=\"Create and Manage Alerts\"> <span class=\"nav-icon\"> <i class=\"ion-android-notifications\"></i> </span> <span class=\"nav-text\">Alerts</span> </a> </li> <li ui-sref-active=\"active\" show-if-has-any-permit=\"jurisdiction:view, servicegroup:view, service:view, priority:view, status:view, user:view, role:view\"> <a ui-sref=\"app.overviews\" title=\"Overviews\"> <span class=\"nav-icon\"> <i class=\"ion-pie-graph\"></i> </span> <span class=\"nav-text\">Overviews</span> </a> </li> <li ui-sref-active=\"active\" show-if-has-any-permit=\"jurisdiction:view, servicegroup:view, service:view, priority:view, status:view, user:view, role:view\"> <a ui-sref=\"app.standings\" title=\"Standings\"> <span class=\"nav-icon\"> <i class=\"ion-arrow-graph-up-right\"></i> </span> <span class=\"nav-text\">Standings</span> </a> </li> <li ui-sref-active=\"active\" show-if-has-any-permit=\"jurisdiction:view, servicegroup:view, service:view, priority:view, status:view, user:view, role:view\"> <a ui-sref=\"app.performances\" title=\"Performances\"> <span class=\"nav-icon\"> <i class=\"ion-ios-pulse-strong\"></i> </span> <span class=\"nav-text\">Performances</span> </a> </li> <li ui-sref-active=\"active\"> <a ui-sref=\"app.operations\" title=\"Operations Reports\"> <span class=\"nav-icon\"> <i class=\"ion-ios-people\"></i> </span> <span class=\"nav-text\">Operations</span> </a> </li> <li ui-sref-active=\"active\" show-if-has-any-permit=\"servicerequest:export\"> <a ui-sref=\"app.exports\" title=\"Exports\"> <span class=\"nav-icon\"> <i class=\"ion-social-buffer\"></i> </span> <span class=\"nav-text\">Exports</span> </a> </li> <li show-if-has-any-permit=\"jurisdiction:view, servicegroup:view, service:view, priority:view, status:view, user:view, role:view\" ui-sref-active=\"active\"> <a ui-sref=\"app.manage.jurisdictions\" title=\"Manage System\"> <span class=\"nav-icon\"> <i class=\"ion-gear-a\"></i> </span> <span class=\"nav-text\">Manage</span> </a> </li> </ul> </nav> </div> <div data-flex-no-shrink> <div uib-dropdown class=\"nav-fold dropup\" title=\"{{ party.name }}\"> <a uib-dropdown-toggle data-toggle=\"dropdown\"> <div class=\"pull-left\"> <div class=\"inline\"> <letter-avatar title=\"{{ party.name }}\" data=\"{{ party.name }}\" height=\"60\" width=\"60\" shape=\"round\" class=\"avatar w-40\"> </letter-avatar> </div> </div> </a> <div uib-dropdown-menu class=\"dropdown-menu w dropdown-menu-scale\"> <a class=\"dropdown-item\" ui-sref=\"app.profile\" title=\"My Profile\"> <span>Profile</span> </a> <a ng-show=\"isAuthenticated\" ng-show=\"isAuthenticated\" data-signout title=\"Signout\" class=\"dropdown-item\" title=\"Signout\"> Sign out </a> </div> </div> </div> </div> "
  );


  $templateCache.put('views/_partials/list_pager.html',
    "<span ng-class=\"{disabled: noPrevious()||ngDisabled, previous: align}\"> <a href ng-click=\"selectPage(page - 1, $event)\" ng-disabled=\"noPrevious()||ngDisabled\" uib-tabindex-toggle class=\"btn btn-default btn-xs\" title=\"Previous\"> <i class=\"fa fa-fw fa-angle-left\" title=\"Previous\"></i> </a> </span> <span> <a href ng-click=\"$parent.all()\" class=\"btn btn-default btn-xs\" title=\"Load All\"> <i class=\"fa fa-fw fa-sort-amount-desc text-muted\" title=\"All\"></i> </a> </span> <span ng-class=\"{disabled: noNext()||ngDisabled, next: align}\"> <a href ng-click=\"selectPage(page + 1, $event)\" ng-disabled=\"noNext()||ngDisabled\" uib-tabindex-toggle class=\"btn btn-default btn-xs\" title=\"Next\"> <i class=\"fa fa-fw fa-angle-right\" title=\"Next\"></i> </a> </span> "
  );


  $templateCache.put('views/_partials/top_navbar.html',
    " <nav class=\"site-navbar navbar navbar-default navbar-mega\" role=\"navigation\"> <div class=\"navbar-header\"> <div class=\"navbar-brand navbar-brand-center\"> <span class=\"navbar-brand-text\">ShuleDirect</span> </div> </div> <div class=\"navbar-container container-fluid\"> <ul class=\"nav navbar-toolbar navbar-right navbar-toolbar-right\"> <li> <a title=\"Notifications\" aria-expanded=\"false\" role=\"button\"> <i class=\"icon ti-bell\" aria-hidden=\"true\"></i> <span class=\"badge badge-danger up\">5</span> </a> </li> <li> <a title=\"Messages\" aria-expanded=\"false\" data-animation=\"scale-up\" role=\"button\"> <i class=\"icon ti-email\" aria-hidden=\"true\"></i> <span class=\"badge badge-info up\">3</span> </a> </li> <li> <a class=\"letter-avatar navbar-avatar\" uib-tooltip=\"Profile\" tooltip-placement=\"bottom\"> <span class=\"avatar avatar-online\"> <letter-avatar data=\"{{party.name}}\" fontfamily=\"Lato\" height=\"40\" width=\"40\" shape=\"round\"> </letter-avatar> <i></i> </span> </a> </li> </ul> </div> </nav> "
  );


  $templateCache.put('views/account/_partials/accessors_list.html',
    " <div class=\"modal-header\"> <div class=\"b-b\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$close()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\">Account Accessors</h4> </div> </div> <div class=\"modal-body\"> <div class=\"box\"> <div class=\"box-header\"> <div class=\"row\"> <div class=\"col-md-9\"> <small>List of people who can access this account billing information</small> </div> <div class=\"col-md-3\"> <a class=\"btn white pull-right\" ng-click=\"addAccessor()\"> <i class=\"ti-plus\"></i>&nbsp;Add new</a> </div> </div> </div> <table class=\"table b-t\"> <thead> <tr> <th>Name</th> <th>Phone Number</th> <th>Email</th> <th>Verified</th> <th>Actions</th> </tr> </thead> <tbody> <tr ng-repeat=\"accessor in accessors\"> <td>{{accessor.name}}</td> <td>{{accessor.phone}}</td> <td>{{accessor.email}}</td> <td>{{accessor.verified ? 'Yes':'No'}}</td> <td> <div class=\"row\"> <a class=\"btn\" title=\"Verify\" ng-click=\"verifyAccessor(accessor.phone)\"><i class=\"ti-check-box text-green-500\"></i></a> <a class=\"btn\" title=\"Edit\" ng-click=\"editAccessor(accessor)\"><i class=\"ti-pencil-alt text-blue-500\"></i></a> <a class=\"btn\" title=\"Remove\" ng-click=\"removeAccessor(accessor.phone)\"><i class=\"ti-trash text-red-500\"></i></a> </div> </td> </tr> </tbody> </table> </div> </div> <div class=\"modal-footer\"> <button class=\"btn btn-default\" ng-click=\"$close()\">Cancel</button> <button class=\"btn btn-primary\" ng-click=\"openAccountDetails()\">Back</button> </div> "
  );


  $templateCache.put('views/account/_partials/account_details.html',
    " <div class=\"modal-header\"> <div class=\"b-b\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$close()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\">Customer Details</h4> </div> </div> <div class=\"modal-body\"> <div class=\"box\"> <div class=\"box-body\"> <div ng-if=\"account\" class=\"item\"> <div class=\"p-a-md\"> <div class=\"row m-t\"> <div class=\"col-md-12\"> <a href=\"#\" class=\"pull-left m-r-md\"> <span> <letter-avatar title=\"{{account.name}}\" data=\"{{account.name}}\" height=\"96\" width=\"96\" shape=\"round\" color=\"{{account.active ? '#63D471':'#EE6352'}}\"> </letter-avatar> <i class=\"on b-white\"></i> </span> </a> <div class=\"clear m-b\"> <div class=\"row-col\"> <h4 class=\"m-a-0 m-b-sm\"> <span title=\"Name\">{{account.name}}</span> <span class=\"m-l-sm\" title=\"Account Number\">#{{account.number}}</span> </h4> </div> <p class=\"text-muted m-t-sm\"> <i class=\"fa fa-map-marker m-r-xs\"></i> <span title=\"Working Area\"> {{account.fullAddress}} </span> </p> <div class=\"block clearfix m-b\"> <span> <a href=\"\" class=\"btn btn-icon btn-social rounded b-a btn-sm\"> <i class=\"icon-phone\"></i> <i class=\"icon-phone indigo\"></i> </a> <span title=\"Phone Number\" class=\"text-muted\"> {{account.phone ? account.phone : 'N/A'}} </span> </span> <span class=\"m-l-md\"> <a href=\"\" class=\"btn btn-icon btn-social rounded b-a btn-sm\"> <i class=\"icon-envelope\"></i> <i class=\"icon-envelope light-blue\"></i> </a> <span title=\"Email Address\" class=\"text-muted\"> {{account.email ? account.email : 'N/A'}} </span> </span> <span class=\"m-l-md\"> <a href=\"\" class=\"btn btn-icon btn-social rounded b-a btn-sm\"> <i class=\"icon-list\"></i> <i class=\"icon-list light-blue\"></i> </a> <a ui-sref=\"account.accessors\" title=\"Account Accessors\" class=\"text-muted\"> View Account Accessors </a> </span> </div> </div> </div> </div> </div> </div> <div ng-if=\"account\" class=\"row m-t-lg\"> <div class=\"box box-shadow-z2\"> <div class=\"box-header\"> <h2> Mini Statement <span class=\"pull-right\">Amount Due: {{account.closingBalance | currency:'Tsh '}}</span> </h2> </div> </div> <uib-tabset active=\"active\" class=\"m-t-lg\"> <uib-tab ng-repeat=\"(key,bill) in account.bills\" index=\"key\" heading=\"{{bill.period.billedAt | date:'MMMM yyyy'}}\"> <div class=\"list box box-shadow-z2\"> <div class=\"box-header b-b\"> <h2> Control Number : {{bill.number}} <small class=\"pull-right text-muted text-sm\">Date of Reading: {{bill.period.billedAt | date:'dd/MM/yyyy'}}</small> </h2> </div> <div class=\"list-item\"> <div class=\"list-body\"> <div class=\"list-item p-t-none p-b-none\" ng-repeat=\"item in bill.items\"> <span title=\"Item Price\" class=\"pull-right text-sm\"> {{item.price | currency:''}} </span> <div class=\"item-title\"> <a href=\"#\" class=\"font-size-14\">{{item.name}} <span title=\"Quantity\" class=\"font-size-13 text-muted\"> &nbsp;{{item.quantity ? '( ' + item.quantity +' '+ item.unit + ' )' :''}} </span> </a> </div> <div class=\"list text-muted\"> <div class=\"list-item p-t-none p-b-none\" ng-repeat=\"subitem in item.items\"> <span title=\"Item Name\" class=\"pull-right text-xs\"> {{subitem.quantity}}&nbsp;{{subitem.unit}} </span> <div class=\"item-title\"> <a href=\"#\" class=\"_500\">{{subitem.name}}<br> <span title=\"Date\" class=\"text-sm text-muted\"> {{subitem.time | date:'dd/MM/yyyy'}} </span> </a> </div> </div> </div> </div> <div class=\"m-t-md\"> <span>Open Balance</span> <small class=\"text-muted pull-right\">{{bill.balance.open | currency:'Tsh '}}</small> </div> <div> <span>Periodic Charges</span> <small class=\"text-muted pull-right\">{{bill.balance.charges | currency:'Tsh '}}</small> </div> <div> <span>Loan/Debt Balance</span> <small class=\"text-muted pull-right\">{{bill.balance.debt | currency:'Tsh '}}</small> </div> <div class=\"m-b-md\"> <span>Closing Balance</span> <small class=\"text-muted pull-right\">{{bill.balance.close | currency:'Tsh '}}</small> </div> <p class=\"_500 text-muted\"> Note:&nbsp;{{bill.notes}} </p> </div> </div> </div> </uib-tab> </uib-tabset> </div> <div class=\"row-col\"> <div ng-if=\"!account\" class=\"row-cell v-m\"> <div class=\"text-center col-sm-6 offset-sm-3 p-y-lg\"> <p class=\"text-muted m-y-lg\">Account Not Found</p> </div> </div> </div> </div> </div> </div> <div class=\"modal-footer\"> <button class=\"btn btn-default\" ng-click=\"$dismiss()\">Cancel</button> <button class=\"btn btn-primary\" ng-click=\"$dismiss()\">OK</button> </div> "
  );


  $templateCache.put('views/account/_partials/create.html',
    " <div class=\"modal-header\"> <div class=\"b-b\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$close()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\">{{title}} Account Accessor</h4> </div> </div> <div class=\"modal-body\"> <div class=\"box\"> <div class=\"m-l-lg m-r-lg\"> <form role=\"form\"> <div class=\"form-group\"> <label for=\"name\">Customer Name</label> <input type=\"text\" ng-model=\"accessor.name\" class=\"form-control\" id=\"name\" placeholder=\"Enter Customer Full Name\" required> </div> <div class=\"form-group\"> <label for=\"phone\">Phone Number</label> <input type=\"text\" ng-model=\"accessor.phone\" class=\"form-control\" id=\"phone\" placeholder=\"Enter Phone Number\" required> </div> <div class=\"form-group\"> <label for=\"email\">Email Address</label> <input type=\"email\" ng-model=\"accessor.email\" class=\"form-control\" id=\"email\" placeholder=\"Enter Email Address\"> </div> </form> </div> </div> </div> <div class=\"modal-footer\"> <button class=\"btn btn-default\" ng-click=\"openAccessorList()\">Back</button> <button class=\"btn btn-primary\" ng-click=\"addAccessor()\">Save</button> </div> "
  );


  $templateCache.put('views/account/index.html',
    " <div ui-view=\"account\"></div> "
  );


  $templateCache.put('views/alerts/_partials/compose.html',
    " <div class=\"modal-header\"> <div class=\"b-b\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$close()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\">Compose An Alert</h4> </div> </div> <div class=\"modal-body\"> <div class=\"box\"> <div class=\"m-l-lg m-r-lg\"> <form role=\"form\"> <div class=\"row m-t-sm\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Subject </h6> </div> </div> <div class=\"col-md-12\"> <input type=\"text\" ng-model=\"alert.subject\" class=\"form-control\" name=\"subject\" placeholder=\"Subject\" required> </div> </div> <div class=\"row\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Message </h6> </div> </div> <div class=\"col-md-12\"> <textarea rows=\"5\" ng-model=\"alert.message\" class=\"form-control\" name=\"message\" placeholder=\"Message ...\" required></textarea> </div> </div> <div class=\"row\" ng-if=\"jurisdictions.length > 1\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Area </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"jurisdiction in jurisdictions | orderBy:'name'\"> <div class=\"p-a p-b-none p-l-none\"> <label class=\"md-check text-muted\" title=\"{{jurisdiction.name}}\"> <input type=\"checkbox\" checklist-model=\"alert.jurisdictions\" checklist-value=\"jurisdiction._id\"> <i class=\"blue\"></i> {{jurisdiction.name}} </label> </div> </div> </div> <div class=\"row m-t-sm\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Audience </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"receiver in receivers | orderBy:'name'\"> <div class=\"p-a p-b-none p-l-none\"> <label class=\"md-check text-muted\" title=\"{{receiver.name}}\"> <input type=\"checkbox\" checklist-value=\"receiver.name\" checklist-model=\"alert.receivers\"> <i class=\"blue\"></i> {{receiver.name}} </label> </div> </div> </div> </form> </div> </div> <div class=\"modal-footer\"> <button class=\"btn btn-default\" ng-click=\"$dismiss()\">Cancel</button> <button class=\"btn btn-primary\" ng-click=\"send()\">Send</button> </div> </div> "
  );


  $templateCache.put('views/alerts/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Alerts ...\"> <span class=\"input-group-btn\"> <button ng-click=\"onSearch()\" class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\" id=\"scrollable-alert-list\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(alert)\" class=\"list-item list-item-padded\" ng-repeat=\"alert in alerts\" title=\"{{alert.subject}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Priority & Alert Type\" data=\"{{alert.subject}}\" height=\"60\" width=\"60\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Alert Issue Date\" class=\"pull-right text-xs text-muted\"> {{alert.createdAt | date:'dd MMM yyyy HH:mm'}} </span> <div class=\"item-title\"> <a href=\"#\" class=\"_500\"> {{alert.subject}} - {{alert.methods.join(', ')}} <br> <span class=\"font-size-12\"> <span class=\"text-muted\" ng-repeat=\"method in alert.methods\"> {{method}} : <span title=\"Total Sent\"> <i class=\"icon-arrow-up-circle\"></i>&nbsp;&nbsp;{{alert.statistics[method].sent}} </span> &nbsp;&nbsp; <span title=\"Total Delivered\"> <i class=\"icon-check\"></i> {{alert.statistics[method].delivered}} &nbsp;&nbsp; </span> <span title=\"Total Failed\"> <i class=\"icon-close\"></i>&nbsp;&nbsp;{{alert.statistics[method].failed}} </span> &nbsp;&nbsp;&nbsp;&nbsp; </span> </span> </a> </div> <small class=\"block text-xs text-muted text-ellipsis\"> <span title=\"Alert Message: {{alert.message}}\"> <i class=\"icon-speech\"></i>&nbsp;&nbsp;{{(alert.message) || 'NA'}} </span> <span class=\"pull-right\" title=\"Alerted Areas\"> <i class=\"icon-location-pin\"></i>&nbsp;&nbsp; {{alert.areas}} </span> </small> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"$parent.total\" ng-model=\"$parent.page\" items-per-page=\"$parent.limit\" ng-change=\"find(query)\" template-url=\"views/_partials/list_pager.html\" style=\"padding-left: 12px\" role=\"group\"></div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/alerts/_partials/side_subnav.html',
    " <div class=\"row-col bg b-r\"> <div class=\"b-b\"> <div class=\"navbar\"> <ul class=\"nav navbar-nav\"> <li class=\"nav-item\"> <span class=\"navbar-item text-md\"> Alerts </span> </li> </ul> </div> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"p-a-md\"> <div class=\"m-b-md\"> <button class=\"btn btn-fw info\" ng-click=\"compose()\"> Compose </button> </div> <div class=\"m-b text-muted text-xs\">Status</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ng-class=\"{active:misc == 'all'}\" class=\"nav-item m-b-xs\"> <a ng-click=\"load({resetPage:true, reset:true, misc:'all'})\" class=\"nav-link text-muted block\" title=\"All Reported Issues\"> All </a> </li> <li class=\"nav-item m-b-xs\" ng-repeat=\"status in statuses | orderBy:'weight'\"> <a ng-click=\"load({'status':status._id, resetPage:true})\" class=\"nav-link text-muted block\"> {{status.name}} </a> </li> </ul> </div> </div> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\">Priority</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li class=\"nav-item m-b-xs\" ng-repeat=\"priority in priorities | orderBy:'weight'\"> <a ng-click=\"load({'status':status._id, resetPage:true})\" class=\"nav-link text-muted block\"> {{priority.name}} </a> </li> </ul> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/alerts/index.html',
    ""
  );


  $templateCache.put('views/alerts/main.html',
    " <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"row-col\"> <div ng-include=\"'views/alerts/_partials/side_subnav.html'\" class=\"col-xs-3 w-xxs modal fade aside aside-md alerts-aside\" id=\"subnav\"></div> <div ng-include=\"'views/alerts/_partials/list.html'\" class=\"col-xs-3 w-xl modal fade aside aside-sm b-r alerts-list\" id=\"list\"></div> </div> </div> </div> "
  );


  $templateCache.put('views/app.html',
    " <div ng-include=\"'views/_partials/aside.html'\" class=\"app-aside fade nav-dropdown folded b-r\"></div> <div ui-view class=\"app-content\" role=\"main\"></div> "
  );


  $templateCache.put('views/auth/_partials/attend_time_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Time taken to attend service request\"> <h3>Attend Time Summary</h3> </div> <div class=\"box-tool\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('services')\" csv-header=\"exports.services.headers\" filename=\"services_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> </ul> </div> <div> <div class=\"row no-gutter\"> <div class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"Maximum Time spent on attending a single Service Request\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> <span title=\"Average resolve Time - Days Spent\"> {{performances.attendTime.max.days}} <span class=\"text-muted text-xs\">days</span> </span> <span title=\"Average resolve Time - Hours Spent\"> {{performances.attendTime.max.hours}} <span class=\"text-muted text-xs\">hrs</span> </span> <span title=\"Average resolve Time - Minutes Spent\"> {{performances.attendTime.max.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </h4> <p class=\"text-muted m-b-md\">Maximum</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"Minimum Time spent on attending a single Service Request\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> <span title=\"Average resolve Time - Days Spent\"> {{performances.attendTime.min.days}} <span class=\"text-muted text-xs\">days</span> </span> <span title=\"Average resolve Time - Hours Spent\"> {{performances.attendTime.min.hours}} <span class=\"text-muted text-xs\">hrs</span> </span> <span title=\"Average resolve Time - Minutes Spent\"> {{performances.attendTime.min.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </h4> <p class=\"text-muted m-b-md\">Minimum</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"Resolved Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> <span title=\"Average resolve Time - Days Spent\"> {{performances.attendTime.average.days}} <span class=\"text-muted text-xs\">days</span> </span> <span title=\"Average resolve Time - Hours Spent\"> {{performances.attendTime.average.hours}} <span class=\"text-muted text-xs\">hrs</span> </span> <span title=\"Average resolve Time - Minutes Spent\"> {{performances.attendTime.average.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </h4> <p class=\"text-muted m-b-md\">Average</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"Late(Past SLA Time) Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> <span title=\"Average resolve Time - Days Spent\"> {{performances.attendTime.target.days}} <span class=\"text-muted text-xs\">days</span> </span> <span title=\"Average resolve Time - Hours Spent\"> {{performances.attendTime.target.hours}} <span class=\"text-muted text-xs\">hrs</span> </span> <span title=\"Average resolve Time - Minutes Spent\"> {{performances.attendTime.target.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </h4> <p class=\"text-muted m-b-md\">Target</p> </div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/auth/_partials/overall_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Overview Summary\"> <h3>Overview Summary</h3> </div> <div class=\"box-tool\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('services')\" csv-header=\"exports.services.headers\" filename=\"services_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> </ul> </div> <div> <div class=\"row no-gutter\"> <div class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"Total Service Requests Received\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.count | number:0}} </h4> <p class=\"text-muted m-b-md\">Total</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Pending Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.pending | number:0}} </h4> <p class=\"text-muted m-b-md\">Pending</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Resolved Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.resolved | number:0}} </h4> <p class=\"text-muted m-b-md\">Resolved</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Late(Past SLA Time) Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.late | number:0}} </h4> <p class=\"text-muted m-b-md\">Late</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-b\" title=\"Overall Target to be reached\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.target | number:0}} </h4> <p class=\"text-muted m-b-md\">Target</p> </div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/auth/_partials/pipeline_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Work Pipeline\"> <h3>Work Pipeline</h3> </div> <div class=\"box-tool\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('services')\" csv-header=\"exports.services.headers\" filename=\"services_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> </ul> </div> <div> <div class=\"row no-gutter\"> <div ng-repeat=\"status in performances.pipelines\" class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"{{status.label.name}} Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{status.count}} </h4> <p class=\"text-muted m-b-md\"> {{status.label.name}} </p> </div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/auth/_partials/profile_filter.html',
    "<div> <div class=\"modal-header\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$dismiss()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\">Profile Reports - Filters</h4> </div> <div class=\"modal-body\"> <div class=\"container-fluid\"> <div class=\"row\"> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> From </h6> </div> <div pickadate ng-model=\"filters.startedAt\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> To </h6> </div> <div pickadate ng-model=\"filters.endedAt\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> </div> </div> </div> <div class=\"modal-footer\"> <button class=\"btn btn-default\" ng-click=\"$dismiss()\">Cancel</button> <button class=\"btn btn-primary\" ng-click=\"filter()\">Filter</button> </div> </div> "
  );


  $templateCache.put('views/auth/_partials/profile_summary.html',
    " <div class=\"item\"> <div class=\"p-a-lg\"> <div class=\"row m-t\"> <div class=\"col-sm-12 col-md-4 col-lg-6\"> <a href=\"#\" class=\"pull-left m-r-md\"> <span> <letter-avatar title=\"{{party.name}}\" data=\"{{party.name}}\" height=\"96\" width=\"96\" shape=\"round\"> </letter-avatar> <i class=\"on b-white\"></i> </span> </a> <div class=\"clear m-b\"> <h4 class=\"m-a-0 m-b-sm\" title=\"Name\">{{party.name}}</h4> <p class=\"text-muted m-t-sm\"> <span class=\"m-r\" title=\"Relation &amp; Workspace\"> {{party.relation.name ? party.relation.name :'N/A'}} / {{party.relation.workspace ? party.relation.workspace : 'N/A' }} </span> <small title=\"Working Area\"> <i class=\"fa fa-map-marker m-r-xs\"></i> {{party.jurisdiction ? party.jurisdiction.name : 'N/A'}} </small> </p> <div class=\"block clearfix m-b\"> <span> <a href=\"\" class=\"btn btn-icon btn-social rounded b-a btn-sm\"> <i class=\"icon-phone\"></i> <i class=\"icon-phone indigo\"></i> </a> <span title=\"Phone Number\" class=\"text-muted\"> {{party.phone ? party.phone : 'N/A'}} </span> </span> <span class=\"m-l-md\"> <a href=\"\" class=\"btn btn-icon btn-social rounded b-a btn-sm\"> <i class=\"icon-envelope\"></i> <i class=\"icon-envelope light-blue\"></i> </a> <span title=\"Email Address\" class=\"text-muted\"> {{party.email ? party.email : 'N/A'}} </span> </span> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/auth/_partials/resolve_time_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Time taken to resolve service request\"> <h3>Resolve Time Summary</h3> </div> <div class=\"box-tool\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('services')\" csv-header=\"exports.services.headers\" filename=\"services_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> </ul> </div> <div> <div class=\"row no-gutter\"> <div class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"Maximum Time spent on attending a single Service Request\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> <span title=\"Average resolve Time - Days Spent\"> {{performances.resolveTime.max.days}} <span class=\"text-muted text-xs\">days</span> </span> <span title=\"Average resolve Time - Hours Spent\"> {{performances.resolveTime.max.hours}} <span class=\"text-muted text-xs\">hrs</span> </span> <span title=\"Average resolve Time - Minutes Spent\"> {{performances.resolveTime.max.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </h4> <p class=\"text-muted m-b-md\">Maximum</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"Minimum Time spent on attending a single Service Request\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> <span title=\"Average resolve Time - Days Spent\"> {{performances.resolveTime.min.days}} <span class=\"text-muted text-xs\">days</span> </span> <span title=\"Average resolve Time - Hours Spent\"> {{performances.resolveTime.min.hours}} <span class=\"text-muted text-xs\">hrs</span> </span> <span title=\"Average resolve Time - Minutes Spent\"> {{performances.resolveTime.min.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </h4> <p class=\"text-muted m-b-md\">Minimum</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"Resolved Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> <span title=\"Average resolve Time - Days Spent\"> {{performances.resolveTime.average.days}} <span class=\"text-muted text-xs\">days</span> </span> <span title=\"Average resolve Time - Hours Spent\"> {{performances.resolveTime.average.hours}} <span class=\"text-muted text-xs\">hrs</span> </span> <span title=\"Average resolve Time - Minutes Spent\"> {{performances.resolveTime.average.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </h4> <p class=\"text-muted m-b-md\">Average</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"Late(Past SLA Time) Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> <span title=\"Average resolve Time - Days Spent\"> {{performances.resolveTime.target.days}} <span class=\"text-muted text-xs\">days</span> </span> <span title=\"Average resolve Time - Hours Spent\"> {{performances.resolveTime.target.hours}} <span class=\"text-muted text-xs\">hrs</span> </span> <span title=\"Average resolve Time - Minutes Spent\"> {{performances.resolveTime.target.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </h4> <p class=\"text-muted m-b-md\">Target</p> </div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/auth/_partials/service_request_counts.html',
    " <div class=\"p-a-lg\"> <div> <h4 title=\"Work Performed\">Work Performed</h4> <small class=\"block text-muted\" title=\"Total Number of Service Requests Received\"> Total Number of Service Requests Received </small> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6 col-md-4 col-lg-3\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>Today</h2> <small>{{performances.works.day.startedAt | date: settings.dateFormat}}</small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <a href=\"#\">{{performances.works.day.count}}</a> </h4> </div> </div> </div> <div class=\"col-sm-6 col-md-4 col-lg-3 offset-lg-1\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>This Week</h2> <small>{{performances.works.week.startedAt | date: settings.dateFormat}} - {{performances.works.week.endedAt | date: settings.dateFormat}} </small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <a href=\"#\">{{performances.works.week.count}}</a> </h4> </div> </div> </div> <div class=\"col-sm-6 col-md-4 col-lg-3 offset-lg-1\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>This Month</h2> <small> {{performances.works.month.startedAt | date: settings.dateFormat}} - {{performances.works.month.endedAt | date: settings.dateFormat}} </small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <a href=\"#\">{{performances.works.month.count}}</a> </h4> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/auth/_partials/service_request_durations.html',
    " <hr> <div class=\"p-a-lg\"> <div> <h4 title=\"Hours Spent Working\">Hours Spent Working</h4> <small class=\"block text-muted\" title=\"Total Number of Hours Spent on Attending Service Requests\"> Total Number of Hours Spent on Attending Service Requests </small> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6 col-md-3 col-lg-3\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>Today</h2> <small>{{performances.durations.day.startedAt | date: settings.dateFormat}}</small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <span> {{(performances.durations.day.duration.days * 24) + performances.durations.day.duration.hours }} <span class=\"text-sm text-muted\">Hours</span> {{performances.durations.day.duration.minutes}} <span class=\"text-sm text-muted\">Minutes</span> </span> </h4> </div> </div> </div> <div class=\"col-sm-6 col-md-3 col-lg-3\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>This Week</h2> <small> {{performances.durations.week.startedAt | date: settings.dateFormat}} - {{performances.durations.week.endedAt | date: settings.dateFormat}} </small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <span> {{(performances.durations.week.duration.days * 24) + performances.durations.week.duration.hours }} <span class=\"text-sm text-muted\">Hours</span> {{performances.durations.week.duration.minutes}} <span class=\"text-sm text-muted\">Minutes</span> </span> </h4> </div> </div> </div> <div class=\"col-sm-6 col-md-3 col-lg-3\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>This Month</h2> <small> {{performances.durations.month.startedAt | date: settings.dateFormat}} - {{performances.durations.month.endedAt | date: settings.dateFormat}} </small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <span> {{(performances.durations.month.duration.days * 24) + performances.durations.month.duration.hours }} <span class=\"text-sm text-muted\">Hours</span> {{performances.durations.month.duration.minutes}} <span class=\"text-sm text-muted\">Minutes</span> </span> </h4> </div> </div> </div> <div class=\"col-sm-6 col-md-3 col-lg-3\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>Average Call Duration</h2> <small> {{party.createdAt | date: settings.dateFormat}} - Present </small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <span> {{(performances.durations.month.duration.days * 24) + performances.durations.month.duration.hours }} <span class=\"text-sm text-muted\">Hours</span> {{performances.durations.month.duration.minutes}} <span class=\"text-sm text-muted\">Minutes</span> </span> </h4> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/auth/_partials/service_request_leaderboard.html',
    " <hr> <div class=\"p-a-lg m-b-lg\"> <div> <h4 title=\"Leaderboard\">Leaderboard</h4> <small class=\"block text-muted\" title=\"Rank Based on Attending Service Requests\"> Rank Based on Attending Service Requests </small> </div> <div class=\"row m-t-lg\"> <ul class=\"list inset m-a-0\"> <li ng-if=\"leader.party\" ng-repeat=\"leader in performances.leaderboard\" class=\"list-item\"> <a href class=\"list-left\"> <letter-avatar title=\"{{leader.party.name}}\" data=\"{{leader.party.name}}\" height=\"40\" width=\"40\" shape=\"round\" fontsize=\"15\"> </letter-avatar> </a> <div class=\"list-body\"> <div> <a href>{{leader.party.name}}</a> <span class=\"pull-right text-muted\">{{leader.count | number:0}}</span> </div> <small class=\"text-muted text-ellipsis\"> {{leader.party.relation.name ? leader.party.relation.name :'N/A'}} / {{leader.party.relation.workspace ? leader.party.relation.workspace : 'N/A' }} <span class=\"pull-right label info\" title=\"#{{$index+1}}\">&nbsp;&nbsp;{{$index + 1}}&nbsp;&nbsp;</span> </small> </div> </li> </ul> </div> </div> "
  );


  $templateCache.put('views/auth/_partials/service_request_pipelines.html',
    " <div> <div class=\"row\"> <div ng-repeat=\"pipeline in performances.pipelines\" class=\"col-xs-6 col-sm-2\" style=\"background-color:{{pipeline.displayColor}};color:#fff\" title=\"{{pipeline.label.name}} Service Requests\"> <div class=\"\"> <div class=\"p-t-md\"> <span class=\"pull-right\"> </span> </div> <div class=\"text-center\"> <h2 class=\"text-center text-2x\" title=\"{{pipeline.count | number:0}}\"> {{pipeline.count | numeraljs:'0a'}} </h2> <p class=\"m-b-md text-sm\">{{pipeline.label.name}}</p> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/auth/_partials/service_requests_breakdown_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Attended Service Requests Breakdown\"> <h3>Attended Service Requests Breakdown</h3> </div> <div class=\"box-tool p-t-sm\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('groups')\" csv-header=\"exports.groups.headers\" filename=\"service_groups_performance_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-7\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th title=\"Service\"> Service </th> <th title=\"Total Count of Service Requests\"> Total </th> <th title=\"Total Count of Open Service Requests\"> open </th> <th title=\"Total Count of In Progress Service Requests\"> In Progress </th> <th title=\"Total Count of Closed Service Requests\"> Close </th> <th title=\"Total Count of Resolved Service Requests\"> Resolved </th> </tr> </thead> <tbody> <tr ng-repeat=\"serviceRequest in performances.breakdown\"> <td title=\"{{serviceRequest.name}}\"> {{serviceRequest.name}} </td> <td title=\"{{serviceRequest.total | number:0}}\"> {{serviceRequest.total | number:0}} </td> <td title=\" {{serviceRequest.open | number:0}}\"> {{serviceRequest.open | number:0}} </td> <td title=\" {{serviceRequest.inprogress | number:0}}\"> {{serviceRequest.inprogress | number:0}} </td> <td title=\" {{serviceRequest.close | number:0}}\"> {{serviceRequest.close | number:0}} </td> <td title=\" {{serviceRequest.resolved | number:0}}\"> {{serviceRequest.resolved | number:0}} </td> </tr> </tbody> </table> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/auth/profile.html',
    " <div class=\"app-header bg b-b bg-white\"> <div class=\"navbar\"> <div class=\"navbar-item pull-left h5 text-md\"> Profile </div> <ul class=\"nav navbar-nav pull-right\"> <li class=\"nav-item\"> <a ng-click=\"showFilter()\" class=\"nav-link\" aria-expanded=\"false\" title=\"Click to Filter Report\"> <i class=\"ion-android-funnel w-24\" title=\"Click To Filter Reports\"></i> </a> </li> </ul> </div> </div> <div class=\"app-body\"> <ng-include src=\"'views/auth/_partials/profile_summary.html'\"></ng-include> <div class=\"row no-gutter\" style=\"display:none\"> <div class=\"col-xs-12 col-sm-6 col-md-6\"> <ng-include ng-if=\"performances.overall\" src=\"'views/auth/_partials/overall_summary.html'\"> </ng-include> </div> <div class=\"col-xs-12 col-sm-6 col-md-6\" style=\"display:none\"> <ng-include ng-if=\"performances.pipelines && performances.pipelines.length > 0\" src=\"'views/auth/_partials/pipeline_summary.html'\"></ng-include> </div> </div> <div class=\"row no-gutter\"> <div class=\"col-xs-12 col-sm-6 col-md-6\" style=\"display:none\"> <ng-include ng-if=\"performances.attendTime\" src=\"'views/auth/_partials/attend_time_summary.html'\"> </ng-include> </div> <div class=\"col-xs-12 col-sm-6 col-md-6\" style=\"display:none\"> <ng-include ng-if=\"performances.resolveTime\" src=\"'views/auth/_partials/resolve_time_summary.html'\"></ng-include> </div> </div> <ng-include ng-if=\"performances.breakdown\" src=\"'views/auth/_partials/service_requests_breakdown_summary.html'\" style=\"display:none\"> </ng-include> <ng-include ng-if=\"performances.leaderboard\" src=\"'views/auth/_partials/service_request_leaderboard.html'\" style=\"display:none\"></ng-include> </div> "
  );


  $templateCache.put('views/auth/signin.html',
    " <div class=\"b-t\"> <div class=\"center-block w-xxl w-auto-xs p-y-lg\"> <div class=\"p-a-md\"> <div class=\"brand m-t-lg m-b-lg text-center\"> <img src=\"images/logo_md.f2b373cb.png\" alt=\".\" width=\"84\"> </div> <form ng-submit=\"signin()\" name=\"signinForm\" role=\"form\" autocomplete=\"new-password\"> <div class=\"form-group\"> <input id=\"username\" class=\"form-control\" name=\"username\" ng-model=\"user.username\" focus-if=\"!user.username\" ng-required title=\"Enter your email or phone number\" placeholder=\"Username\"> </div> <div class=\"form-group\"> <input id=\"password\" class=\"form-control\" type=\"password\" name=\"password\" ng-model=\"user.password\" ng-required title=\"Enter your password\" placeholder=\"Password\"> </div> <button ng-disabled=\"signinForm.$invalid || !user.username || !user.password\" type=\"submit\" class=\"btn btn-primary btn-block m-t-sm\"> Sign in </button> </form> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/area_per_service_group_leaderboard.html',
    " <hr> <div class=\"p-a-lg\"> <div> <h4 title=\"Work Performed\">Issue per Area per Service Group</h4> <small class=\"block text-muted\" title=\"Count of Reported Issues by Their Area and Service Group\"> Count of Reported Issues by Their Area and Service Group </small> </div> <div class=\"row m-t md\"> <div class=\"box\"> <div class=\"row p-a\"> <div class=\"col-sm-10\"></div> <div class=\"col-sm-2\"> <div class=\"dt-buttons btn-group\"> <a class=\"btn btn-secondary buttons-copy buttons-html5\" title=\"Visualize\" tabindex=\"0\" href=\"#\"> <i class=\"icon-eye\"></i> </a> <a class=\"btn btn-secondary buttons-excel buttons-html5\" title=\"Export as CSV\" tabindex=\"0\" href=\"#\"> <i class=\"icon-cloud-download\"></i> </a> </div> </div> </div> <div class=\"table-responsive\"> <table class=\"table table-bordered b-t table-tabular\"> <thead> <tr> <th>Area</th> <th ng-repeat=\"group in groups\">{{group.name}}</th> <th>Total</th> </tr> </thead> <tbody> <tr ng-repeat=\"area in areaPerServiceGroup\"> <td>{{area.name}}</td> <td ng-repeat=\"group in area.groups\">{{group.count}}</td> <td>{{area.total}}</td> </tr> </tbody> </table> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/area_per_service_leaderboard.html',
    " <hr> <div class=\"p-a-lg\"> <div> <h4 title=\"Area standing report\">Area per Service</h4> <small class=\"block text-muted\" title=\"Count of Reported Issues by Their Area and Service\"> Count of Reported Issues by Their Area and Service </small> </div> <div class=\"row m-t-md\"> <div class=\"box\"> <div class=\"row p-a\"> <div class=\"col-sm-10\"></div> <div class=\"col-sm-2\"> <div class=\"dt-buttons btn-group\"> <a class=\"btn btn-secondary buttons-copy buttons-html5\" title=\"Visualize\" tabindex=\"0\" href=\"#\"> <i class=\"icon-eye\"></i> </a> <a class=\"btn btn-secondary buttons-excel buttons-html5\" title=\"Export as CSV\" tabindex=\"0\" href=\"#\"> <i class=\"icon-cloud-download\"></i> </a> </div> </div> </div> <div class=\"table-responsive\"> <table class=\"table table-bordered b-t table-tabular\"> <thead> <tr> <th>Service</th> <th ng-repeat=\"area in areas\">{{area.name}}</th> <th>Total</th> </tr> </thead> <tbody> <tr ng-repeat=\"service in areaPerService\"> <td>{{service.name}}</td> <td ng-repeat=\"area in service.areas\">{{area.count}}</td> <td>{{service.total}}</td> </tr> </tbody> </table> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/area_per_status_leaderboard.html',
    " <div class=\"p-a-lg\"> <div> <h4 title=\"Work Performed\">Issue per Area per Status - Work Progress</h4> <small class=\"block text-muted\" title=\"Count of Reported Issues by Their Area and Status\"> Count of Reported Issues by Their Area and Status </small> </div> <div class=\"row m-t-md\"> <div class=\"box\"> <div class=\"row p-a\"> <div class=\"col-sm-10\"></div> <div class=\"col-sm-2\"> <div class=\"dt-buttons btn-group\"> <a class=\"btn btn-secondary buttons-copy buttons-html5\" title=\"Visualize\" tabindex=\"0\" href=\"#\"> <i class=\"icon-eye\"></i> </a> <a class=\"btn btn-secondary buttons-excel buttons-html5\" title=\"Export as CSV\" tabindex=\"0\" href=\"#\"> <i class=\"icon-cloud-download\"></i> </a> </div> </div> </div> <div class=\"table-responsive\"> <table class=\"table table-bordered b-t table-tabular\"> <thead> <tr> <th>Area</th> <th ng-repeat=\"status in statuses\"> {{status.name}} </th> <th>Total</th> </tr> </thead> <tbody> <tr ng-repeat=\"area in areaPerStatus\"> <td>{{area.name}}</td> <td ng-repeat=\"status in area.statuses\"> {{status.count}} </td> <td>{{area.total}}</td> </tr> </tbody> </table> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/overviews_filter.html',
    "<div> <div class=\"modal-header\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$dismiss()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\">Overview Reports - Filters</h4> </div> <div class=\"modal-body\"> <div class=\"container-fluid\"> <div class=\"row\"> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> From </h6> </div> <div pickadate ng-model=\"filters.startedAt\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> To </h6> </div> <div pickadate ng-model=\"filters.endedAt\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> </div> <div class=\"row m-t-sm\" ng-if=\"jurisdictions.length > 1\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Area </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"jurisdiction in jurisdictions | orderBy:'name'\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{jurisdiction.name}}\"> <input type=\"checkbox\" checklist-model=\"filters.jurisdictions\" checklist-value=\"jurisdiction._id\"> <i class=\"blue\"></i> {{jurisdiction.name}} </label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Service Group </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"servicegroup in servicegroups | orderBy:'name'\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{servicegroup.name}}\"> <input type=\"checkbox\" checklist-model=\"filters.servicegroups\" checklist-value=\"servicegroup._id\"> <i class=\"blue\"></i>{{servicegroup.name}} </label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Service </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"service in services | orderBy:'name'\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{service.name}}\"> <input type=\"checkbox\" checklist-model=\"filters.services\" checklist-value=\"service._id\"> <i class=\"blue\"></i>{{service.name}} </label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Status </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"status in statuses | orderBy:'weight'\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{status.name}}\"> <input type=\"checkbox\" checklist-model=\"filters.statuses\" checklist-value=\"status._id\"> <i class=\"blue\"></i>{{status.name}} </label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Priority </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"priority in priorities | orderBy:'weight'\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{priority.name}}\"> <input type=\"checkbox\" checklist-model=\"filters.priorities\" checklist-value=\"priority._id\"> <i class=\"blue\"></i>{{priority.name}} </label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Workspace </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"workspace in workspaces\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{workspace}}\"> <input type=\"checkbox\" checklist-model=\"filters.workspaces\" checklist-value=\"workspace\"> <i class=\"blue\"></i>{{workspace}} </label> </div> </div> </div> </div> </div> <div class=\"modal-footer\"> <button class=\"btn btn-default\" ng-click=\"$dismiss()\">Cancel</button> <button class=\"btn btn-primary\" ng-click=\"filter()\">Filter</button> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/performances_filter.html',
    "<div> <div class=\"modal-header\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$dismiss()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\">Performances Reports - Filters</h4> </div> <div class=\"modal-body\"> <div class=\"container-fluid\"> <div class=\"row\"> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> From </h6> </div> <div pickadate ng-model=\"filters.startedAt\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> To </h6> </div> <div pickadate ng-model=\"filters.endedAt\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> </div> <div class=\"row m-t-sm\" ng-if=\"jurisdictions.length > 1\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Area </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"jurisdiction in jurisdictions | orderBy:'name'\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{jurisdiction.name}}\"> <input type=\"radio\" ng-model=\"filters.jurisdictions\" ng-value=\"jurisdiction._id\"> <i class=\"blue\"></i> {{jurisdiction.name}} </label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Workspace </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"workspace in workspaces\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{workspace}}\"> <input type=\"checkbox\" checklist-model=\"filters.workspaces\" checklist-value=\"workspace\"> <i class=\"blue\"></i>{{workspace}} </label> </div> </div> </div> </div> </div> <div class=\"modal-footer\"> <button class=\"btn btn-default\" ng-click=\"$dismiss()\">Cancel</button> <button class=\"btn btn-primary\" ng-click=\"filter()\">Filter</button> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/service_group_per_status_leaderboard.html',
    " <hr> <div class=\"p-a-lg\"> <div> <h4 title=\"Work Performed\">Issue per Service Groups per Status</h4> <small class=\"block text-muted\" title=\"Count of Reported Issues by Service Group and Status\"> Count of Reported Issues by Service Group and Status </small> </div> <div class=\"row m-t-md\"> <div class=\"box\"> <div class=\"row p-a\"> <div class=\"col-sm-10\"></div> <div class=\"col-sm-2\"> <div class=\"dt-buttons btn-group\"> <a class=\"btn btn-secondary buttons-copy buttons-html5\" title=\"Visualize\" tabindex=\"0\" href=\"#\"> <i class=\"icon-eye\"></i> </a> <a class=\"btn btn-secondary buttons-excel buttons-html5\" title=\"Export as CSV\" tabindex=\"0\" href=\"#\"> <i class=\"icon-cloud-download\"></i> </a> </div> </div> </div> <div class=\"table-responsive\"> <table class=\"table table-bordered b-t table-tabular\"> <thead> <tr> <th>Service Group</th> <th ng-repeat=\"status in statuses\">{{status.name}}</th> <th>Total</th> </tr> </thead> <tbody> <tr ng-repeat=\"serviceGroup in serviceGroupPerStatus\"> <td>{{serviceGroup.name}}</td> <td ng-repeat=\"status in serviceGroup.statuses\"> {{status.count}} </td> <td>{{serviceGroup.total}}</td> </tr> </tbody> </table> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/service_per_status_leaderboard.html',
    " <hr> <div class=\"p-a-lg\"> <div> <h4 title=\"Work Performed\">Issue per Status</h4> <small class=\"block text-muted\" title=\"Count of Reported Issues by Their Status\"> Count of Reported Issues by Their Status </small> </div> <div class=\"row m-t-md\"> <div class=\"box\"> <div class=\"row p-a\"> <div class=\"col-sm-10\"></div> <div class=\"col-sm-2\"> <div class=\"dt-buttons btn-group\"> <a class=\"btn btn-secondary buttons-copy buttons-html5\" title=\"Visualize\" tabindex=\"0\" href=\"#\"> <i class=\"icon-eye\"></i> </a> <a class=\"btn btn-secondary buttons-excel buttons-html5\" title=\"Export as CSV\" tabindex=\"0\" href=\"#\"> <i class=\"icon-cloud-download\"></i> </a> </div> </div> </div> <div class=\"table-responsive\"> <table class=\"table table-bordered b-t table-tabular\"> <thead> <tr> <th>Service</th> <th ng-repeat=\"status in statuses\">{{status.name}}</th> <th>Total</th> </tr> </thead> <tbody> <tr ng-repeat=\"service in servicePerStatus\"> <td>{{service.name}}</td> <td ng-repeat=\"status in service.statuses\">{{status.count}}</td> <td>{{service.total}}</td> </tr> </tbody> </table> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/service_request_area_leaderboard.html',
    " <div> <h4 title=\"Leaderboard\">Area Standing</h4> <small class=\"block text-muted\" title=\"Area Rank Based on Number of Service Requests\"> Area Rank Based on Number of Service Requests </small> </div> <div class=\"m-t-lg\"> <ul class=\"list inset m-a-0\"> <li ng-if=\"leader\" ng-repeat=\"leader in performances.jurisdictions\" class=\"list-item\"> <a href class=\"list-left\"> <letter-avatar title=\"{{leader.name}}\" data=\"{{leader.name}}\" height=\"40\" width=\"40\" shape=\"round\" fontsize=\"15\"> </letter-avatar> </a> <div class=\"list-body\"> <div> <a href>{{leader.name}}</a> <span class=\"pull-right text-muted\">{{leader.count | number:0}}</span> </div> <small class=\"text-muted text-ellipsis\"> {{leader.phone ? leader.phone :'N/A'}} / {{leader.email ? leader.email : 'N/A' }} <span class=\"pull-right label info\" title=\"#{{$index+1}}\">&nbsp;&nbsp;{{$index + 1}}&nbsp;&nbsp;</span> </small> </div> </li> </ul> </div> "
  );


  $templateCache.put('views/dashboards/_partials/service_request_counts.html',
    " <div class=\"p-a-lg\"> <div> <h4 title=\"Work Performed\">Work Performed</h4> <small class=\"block text-muted\" title=\"Total Number of Service Requests Received\"> Total Number of Service Requests Received </small> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6 col-md-4 col-lg-3\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>Today</h2> <small>{{performances.works.day.startedAt | date: settings.dateFormat}}</small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <a href=\"#\">{{performances.works.day.count}}</a> </h4> </div> </div> </div> <div class=\"col-sm-6 col-md-4 col-lg-3 offset-lg-1\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>This Week</h2> <small>{{performances.works.week.startedAt | date: settings.dateFormat}} - {{performances.works.week.endedAt | date: settings.dateFormat}} </small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <a href=\"#\">{{performances.works.week.count}}</a> </h4> </div> </div> </div> <div class=\"col-sm-6 col-md-4 col-lg-3 offset-lg-1\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>This Month</h2> <small> {{performances.works.month.startedAt | date: settings.dateFormat}} - {{performances.works.month.endedAt | date: settings.dateFormat}} </small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <a href=\"#\">{{performances.works.month.count}}</a> </h4> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/service_request_durations.html',
    " <hr> <div class=\"p-a-lg\"> <div> <h4 title=\"Hours Spent Working\">Hours Spent Working</h4> <small class=\"block text-muted\" title=\"Total Number of Hours Spent on Attending Service Requests\"> Total Number of Hours Spent on Attending Service Requests </small> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6 col-md-3 col-lg-3\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>Today</h2> <small>{{performances.durations.day.startedAt | date: settings.dateFormat}}</small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <span> {{(performances.durations.day.duration.days * 24) + performances.durations.day.duration.hours }} <span class=\"text-sm text-muted\">Hours</span> {{performances.durations.day.duration.minutes}} <span class=\"text-sm text-muted\">Minutes</span> </span> </h4> </div> </div> </div> <div class=\"col-sm-6 col-md-3 col-lg-3\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>This Week</h2> <small> {{performances.durations.week.startedAt | date: settings.dateFormat}} - {{performances.durations.week.endedAt | date: settings.dateFormat}} </small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <span> {{(performances.durations.week.duration.days * 24) + performances.durations.week.duration.hours }} <span class=\"text-sm text-muted\">Hours</span> {{performances.durations.week.duration.minutes}} <span class=\"text-sm text-muted\">Minutes</span> </span> </h4> </div> </div> </div> <div class=\"col-sm-6 col-md-3 col-lg-3\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>This Month</h2> <small> {{performances.durations.month.startedAt | date: settings.dateFormat}} - {{performances.durations.month.endedAt | date: settings.dateFormat}} </small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <span> {{(performances.durations.month.duration.days * 24) + performances.durations.month.duration.hours }} <span class=\"text-sm text-muted\">Hours</span> {{performances.durations.month.duration.minutes}} <span class=\"text-sm text-muted\">Minutes</span> </span> </h4> </div> </div> </div> <div class=\"col-sm-6 col-md-3 col-lg-3\"> <div class=\"box p-a box-shadow-z2\"> <div class=\"box-header\"> <h2>Average Call Duration</h2> <small> {{party.createdAt | date: settings.dateFormat}} - Present </small> </div> <div class=\"box-body\"> <h4 class=\"m-a-0 text-3x\"> <span> {{(performances.durations.month.duration.days * 24) + performances.durations.month.duration.hours }} <span class=\"text-sm text-muted\">Hours</span> {{performances.durations.month.duration.minutes}} <span class=\"text-sm text-muted\">Minutes</span> </span> </h4> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/service_request_groups.html',
    " <div> <div class=\"row\"> <div ng-repeat=\"group in performances.groups\" class=\"col-xs-6 col-sm-2\" style=\"background-color:{{group.color}};color:#fff\" title=\"{{group.label.name}} Service Requests\"> <div class=\"\"> <div class=\"p-t-md\"> <span class=\"pull-right\"> </span> </div> <div class=\"text-center\"> <h2 class=\"text-center text-md\" title=\"{{group.count | number:0}}\"> {{group.count | numeraljs:'0a'}} </h2> <p class=\"m-b-md text-sm\">{{group.name}}</p> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/service_request_leaderboard.html',
    " <div> <h4 title=\"Leaderboard\">Leaderboard</h4> <small class=\"block text-muted\" title=\"Operator Ranking Based on Attending Service Requests\"> Operator Ranking Based on Attending Service Requests </small> </div> <div class=\"m-t-lg\"> <ul class=\"list inset m-a-0\"> <li ng-if=\"leader\" ng-repeat=\"leader in performances.operators\" class=\"list-item\"> <a href class=\"list-left\"> <letter-avatar title=\"{{leader.name}}\" data=\"{{leader.name}}\" height=\"40\" width=\"40\" shape=\"round\" fontsize=\"15\"> </letter-avatar> </a> <div class=\"list-body\"> <div> <a href>{{leader.name}}</a> <span class=\"pull-right text-muted\">{{leader.count | number:0}}</span> </div> <small class=\"text-muted text-ellipsis\"> {{leader.relation.name ? leader.relation.name :'N/A'}} / {{leader.relation.workspace ? leader.relation.workspace : 'N/A' }} <span class=\"pull-right label info\" title=\"#{{$index+1}}\">&nbsp;&nbsp;{{$index + 1}}&nbsp;&nbsp;</span> </small> </div> </li> </ul> </div> "
  );


  $templateCache.put('views/dashboards/_partials/service_request_pipelines.html',
    " <div> <div class=\"row\"> <div class=\"col-xs-6 col-sm-2\">&nbsp;</div> <div ng-repeat=\"pipeline in performances.statuses\" class=\"col-xs-6 col-sm-2\" style=\"background-color:{{pipeline.color}};color:#fff\" title=\"{{pipeline.name}} Service Requests\"> <div class=\"\"> <div class=\"p-t-md\"> <span class=\"pull-right\"> </span> </div> <div class=\"text-center\"> <h2 class=\"text-center text-md\" title=\"{{pipeline.count | number:0}}\"> {{pipeline.count | numeraljs:'0a'}} </h2> <p class=\"m-b-md text-sm\">{{pipeline.name}}</p> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/service_request_summaries.html',
    " <div> <div class=\"row\"> <div ng-repeat=\"summary in performances.summaries\" class=\"col-xs-6 col-sm-2\" style=\"background-color:{{summary.color}};color:#fff\" title=\"{{summary.name}} Service Requests\"> <div class=\"\"> <div class=\"p-t-md\"> <span class=\"pull-right\"> </span> </div> <div class=\"text-center\"> <h2 class=\"text-center text-md\" title=\"{{summary.count | number:0}}\"> {{summary.count | numeraljs:'0a'}} </h2> <p class=\"m-b-md text-sm\">{{summary.name}}</p> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/_partials/standings_filter.html',
    "<div> <div class=\"modal-header\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$dismiss()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\">Standing Reports - Filters</h4> </div> <div class=\"modal-body\"> <div class=\"container-fluid\"> <div class=\"row\"> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> From </h6> </div> <div pickadate ng-model=\"filters.startedAt\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> To </h6> </div> <div pickadate ng-model=\"filters.endedAt\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> </div> <div class=\"row m-t-sm\" ng-if=\"jurisdictions.length > 1\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Area </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"jurisdiction in jurisdictions | orderBy:'name'\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{jurisdiction.name}}\"> <input type=\"checkbox\" checklist-model=\"filters.jurisdictions\" checklist-value=\"jurisdiction._id\"> <i class=\"blue\"></i> {{jurisdiction.name}} </label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Service Group </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"servicegroup in servicegroups | orderBy:'name'\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{servicegroup.name}}\"> <input type=\"checkbox\" checklist-model=\"filters.servicegroups\" checklist-value=\"servicegroup._id\"> <i class=\"blue\"></i>{{servicegroup.name}} </label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Service </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"service in services | orderBy:'name'\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{service.name}}\"> <input type=\"checkbox\" checklist-model=\"filters.services\" checklist-value=\"service._id\"> <i class=\"blue\"></i>{{service.name}} </label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Status </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"status in statuses | orderBy:'weight'\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{status.name}}\"> <input type=\"checkbox\" checklist-model=\"filters.statuses\" checklist-value=\"status._id\"> <i class=\"blue\"></i>{{status.name}} </label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Priority </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"priority in priorities | orderBy:'weight'\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{priority.name}}\"> <input type=\"checkbox\" checklist-model=\"filters.priorities\" checklist-value=\"priority._id\"> <i class=\"blue\"></i>{{priority.name}} </label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Workspace </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"workspace in workspaces\"> <div class=\"p-a p-b-none\"> <label class=\"md-check text-muted\" title=\"{{workspace}}\"> <input type=\"checkbox\" checklist-model=\"filters.workspaces\" checklist-value=\"workspace\"> <i class=\"blue\"></i>{{workspace}} </label> </div> </div> </div> </div> </div> <div class=\"modal-footer\"> <button class=\"btn btn-default\" ng-click=\"$dismiss()\">Cancel</button> <button class=\"btn btn-primary\" ng-click=\"filter()\">Filter</button> </div> </div> "
  );


  $templateCache.put('views/dashboards/comparison.html',
    " <div class=\"app-header bg b-b bg-white\"> <div class=\"navbar\"> <div class=\"navbar-item pull-left h5 text-md\"> Comparison </div> <ul class=\"nav navbar-nav pull-right\"> <li class=\"nav-item\"> <a ng-click=\"showFilter()\" class=\"nav-link\" aria-expanded=\"false\" title=\"Click to Filter Report\"> <i class=\"ion-android-funnel w-24\" title=\"Click To Filter Reports\"></i> </a> </li> </ul> </div> </div> <div class=\"app-body\"> <div class=\"padding m-l-md m-t\"> <div class=\"row\"> <div class=\"col-sm-5\"></div> <div class=\"col-sm-7\"> <ng-include src=\"'views/dashboards/_partials/service_request_pipelines.html'\"></ng-include> </div> </div> </div> <ng-include ng-if=\"areaPerStatus\" src=\"'views/dashboards/_partials/area_per_status_leaderboard.html'\"></ng-include> <ng-include ng-if=\"areaPerServiceGroup\" src=\"'views/dashboards/_partials/area_per_service_group_leaderboard.html'\"></ng-include> <ng-include ng-if=\"servicePerStatus\" src=\"'views/dashboards/_partials/service_per_status_leaderboard.html'\"></ng-include> <ng-include ng-if=\"areaPerService\" src=\"'views/dashboards/_partials/area_per_service_leaderboard.html'\"></ng-include> <ng-include ng-if=\"serviceGroupPerStatus\" src=\"'views/dashboards/_partials/service_group_per_status_leaderboard.html'\"></ng-include> </div> "
  );


  $templateCache.put('views/dashboards/exports.html',
    " <div class=\"app-header bg b-b bg-white\"> <div class=\"navbar\"> <div class=\"navbar-item pull-left h5 text-md\"> Bulk - Exports </div> </div> </div> <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"padding\"> <div class=\"row\"> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> From </h6> </div> <div pickadate ng-model=\"filters.startedAt\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> To </h6> </div> <div pickadate ng-model=\"filters.endedAt\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> </div> <div class=\"row m-t-sm\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Area </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"jurisdiction in jurisdictions\"> <div class=\"checkbox-custom checkbox-primary p-a p-b-none\"> <input type=\"checkbox\" checklist-model=\"filters.jurisdictions\" checklist-value=\"jurisdiction._id\"> <label class=\"text-muted\" title=\"{{jurisdiction.name}}\">{{jurisdiction.name}}</label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Service Group </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"servicegroup in servicegroups\"> <div class=\"checkbox-custom checkbox-primary p-a p-b-none\"> <input type=\"checkbox\" checklist-model=\"filters.servicegroups\" checklist-value=\"servicegroup._id\" checklist-change=\"filterServices()\"> <label class=\"text-muted\" title=\"{{servicegroup.name}}\">{{servicegroup.name}}</label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Service </h6> </div> </div> <div class=\"col-md-3\" ng-repeat=\"service in services\"> <div class=\"checkbox-custom checkbox-primary p-a p-b-none\"> <input type=\"checkbox\" checklist-model=\"filters.services\" checklist-value=\"service._id\"> <label class=\"text-muted\" title=\"{{service.name}}\">{{service.name}}</label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Status </h6> </div> </div> <div class=\"col-md-2\" ng-repeat=\"status in statuses\"> <div class=\"checkbox-custom checkbox-primary p-a\"> <input type=\"checkbox\" checklist-model=\"filters.statuses\" checklist-value=\"status._id\"> <label class=\"text-muted\" title=\"{{status.name}}\">{{status.name}}</label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Priority </h6> </div> </div> <div class=\"col-md-2\" ng-repeat=\"priority in priorities\"> <div class=\"checkbox-custom checkbox-primary p-a\"> <input type=\"checkbox\" checklist-model=\"filters.priorities\" checklist-value=\"priority._id\"> <label class=\"text-muted\" title=\"{{priority.name}}\">{{priority.name}}</label> </div> </div> </div> <div class=\"row m-t-md\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Workspace </h6> </div> </div> <div class=\"col-md-2\" ng-repeat=\"workspace in workspaces\"> <div class=\"checkbox-custom checkbox-primary p-a\"> <input type=\"checkbox\" checklist-model=\"filters.workspaces\" checklist-value=\"workspace\"> <label class=\"text-muted\" title=\"{{workspace}}\">{{workspace}}</label> </div> </div> </div> <div class=\"row m-t-md m-b-lg\"> <div class=\"col-md-12\"> <div class=\"pull-right\"> <button class=\"btn btn-primary\" ng-click=\"export()\">Export</button> <button class=\"btn btn-default m-l-sm\" ng-click=\"export(true)\"> Clear&nbsp; </button> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/operation/_partials/average_time_summary.html',
    " <div class=\"row no-gutter\"> <div class=\"col-xs-6 col-sm-6 b-a\" title=\"Average Attend Time(Call Duration)\"> <div> <div class=\"text-center\"> <h2 class=\"text-center _600 m-t-md\"> <span title=\"Average Attend Time(Call Duration) - Minutes Spent\"> {{performances.overall.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> <span title=\"Average Attend Time(Call Duration) - Seconds Spent\"> {{performances.overall.averageAttendTime.seconds}} <span class=\"text-muted text-xs\">secs</span> </span> </h2> <p class=\"text-muted m-b-md\">Average Attend Time</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-6 b-b b-t b-r\" title=\"Average resolve Time\"> <div> <div class=\"text-center\"> <h2 class=\"text-center _600 m-t-md\"> <span title=\"Average resolve Time - Days Spent\"> {{performances.overall.averageResolveTime.days}} <span class=\"text-muted text-xs\">days</span> </span> <span title=\"Average resolve Time - Hours Spent\"> {{performances.overall.averageResolveTime.hours}} <span class=\"text-muted text-xs\">hrs</span> </span> <span title=\"Average resolve Time - Minutes Spent\"> {{performances.overall.averageResolveTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </h2> <p class=\"text-muted m-b-md\">Average Resolve Time</p> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/operation/_partials/jurisdiction_summary.html',
    " <div class=\"item\"> <div class=\"p-a-lg\"> <div class=\"row m-t\"> <div class=\"col-sm-12 col-md-6 col-lg-6\"> <a href=\"#\" class=\"pull-left m-r-md\"> <span> <letter-avatar title=\"{{jurisdiction.name}}\" data=\"{{jurisdiction.name}}\" height=\"96\" width=\"96\" shape=\"round\"> </letter-avatar> <i class=\"on b-white\"></i> </span> </a> <div class=\"clear m-b\"> <h4 class=\"m-a-0 m-b-sm\" title=\"Name\">{{jurisdiction.name}}</h4> <div class=\"block clearfix m-t-md m-b\"> <span> <a href=\"\" class=\"btn btn-icon btn-social rounded b-a btn-sm\"> <i class=\"icon-phone\"></i> <i class=\"icon-phone indigo\"></i> </a> <span title=\"Phone Number\" class=\"text-muted\"> {{jurisdiction.phone ? jurisdiction.phone : 'N/A'}} </span> </span> <span class=\"m-l-md\"> <a href=\"\" class=\"btn btn-icon btn-social rounded b-a btn-sm\"> <i class=\"icon-envelope\"></i> <i class=\"icon-envelope light-blue\"></i> </a> <span title=\"Email Address\" class=\"text-muted\"> {{jurisdiction.email ? jurisdiction.email : 'N/A'}} </span> </span> </div> </div> </div> <div class=\"col-sm-12 col-md-6 col-lg-6 pull-right\"> <ng-include src=\"'views/dashboards/performance/_partials/average_time_summary.html'\"></ng-include> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/operation/_partials/jurisdiction_zone_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Areas Summary\"> <h3>Zones Summary</h3> </div> <div class=\"box-tool p-t-sm\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('jurisdictions')\" csv-header=\"exports.jurisdictions.headers\" filename=\"jurisdictions_overview_reports_{{\n" +
    "              filters.startedAt | date: settings.dateFormat\n" +
    "            }}_{{ filters.endedAt | date: settings.dateFormat }}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-12\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th title=\"Area\"> Zone </th> <th title=\"Total Count of Service Requests\"> Total </th> <th title=\"Total Count of Pending Service Requests\"> In Progress </th> <th title=\"Total Count of Done Service Requests\"> Done </th> <th title=\"Total Count of Verified Service Requests\"> Verified </th> <th title=\"Total Count of Approved and Closed Zone Service Requests\"> Closed </th> <th title=\"Total Count of Late Zone Service Requests\"> Late </th> </tr> </thead> <tbody> <tr ng-repeat=\"zone in zones\"> <td title=\"{{ zone.name }}\"> {{ zone.name }} </td> <td title=\"{{ zone.total | number: 0 }}\"> {{ zone.total | number: 0 }} </td> <td title=\" {{ zone.inProgress | number: 0 }}\"> {{ zone.inProgress | number: 0 }} </td> <td title=\" {{ zone.done | number: 0 }}\"> {{ zone.done | number: 0 }} </td> <td title=\" {{ zone.verified | number: 0 }}\"> {{ zone.verified | number: 0 }} </td> <td title=\" {{ zone.closed | number: 0 }}\"> {{ zone.closed | number: 0 }} </td> <td title=\" {{ zone.late | number: 0 }}\"> {{ zone.late | number: 0 }} </td> </tr> </tbody> </table> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/operation/_partials/material_used_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Material Used Summary\"> <h3>Material Used Summary</h3> </div> <div class=\"box-tool p-t-sm\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('groups')\" csv-header=\"exports.groups.headers\" filename=\"service_groups_performance_reports_{{\n" +
    "              filters.startedAt | date: settings.dateFormat\n" +
    "            }}_{{ filters.endedAt | date: settings.dateFormat }}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-12\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th ng-click=\"prepareServiceGroupVisualization('count')\" title=\"Area\"> Material </th> <th ng-click=\"prepareServiceGroupVisualization('count')\" title=\"Total Count of Service Requests\"> Quantity </th> </tr> </thead> <tbody> <tr ng-repeat=\"item in materials\"> <td title=\"{{ group.name }}\"> {{ item.name }} </td> <td title=\"{{ group.count | number: 0 }}\"> {{ item.quantity | number: 0 }} </td> </tr> </tbody> </table> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/operation/_partials/overall_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Overview Summary\"> <h3>Overview Summary</h3> </div> <div class=\"box-tool\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('services')\" csv-header=\"exports.services.headers\" filename=\"services_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row no-gutter\"> <div class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"Total Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.count | number:0}} </h4> <p class=\"text-muted m-b-md\">Total</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Pending Service Requests\"> <div class=\"p-a-sm\"> <div> <span class=\"pull-right text-xs\" ng-class=\"performances.overall.percentagePending <= 50 ? 'text-success' : 'text-danger'\">{{performances.overall.percentagePending | number:2}}%</span> </div> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.pending | number:0}} </h4> <p class=\"text-muted m-b-md\">Pending</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Resolved Service Requests\"> <div class=\"p-a-sm\"> <div> <span class=\"pull-right text-xs\" ng-class=\"performances.overall.percentageResolved >= 50 ? 'text-success' : 'text-danger'\">{{performances.overall.percentageResolved | number:2}}%</span> </div> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.resolved | number:0}} </h4> <p class=\"text-muted m-b-md\">Resolved</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Late(Past SLA Time) Service Requests\"> <div class=\"p-a-sm\"> <div> <span class=\"pull-right text-xs\" ng-class=\"performances.overall.percentageLate > 0 ? 'text-danger' : 'text-success'\">{{performances.overall.percentageLate | number:2}}%</span> </div> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.late | number:0}} </h4> <p class=\"text-muted m-b-md\">Late</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-b\" title=\"Late(Past SLA Time) Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.late | number:0}} </h4> <p class=\"text-muted m-b-md\">Escallated</p> </div> </div> </div> </div> <div class=\"p-a-md\"> <echart config=\"perSummaryConfig\" options=\"perSummaryOptions\"></echart> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/operation/_partials/pipeline_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Work Pipeline\"> <h3>Work Pipeline</h3> </div> <div class=\"box-tool\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('services')\" csv-header=\"exports.services.headers\" filename=\"services_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row no-gutter\"> <div ng-repeat=\"status in performances.statuses\" class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"{{status.name}} Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{status.count}} </h4> <p class=\"text-muted m-b-md\"> {{status.name}} </p> </div> </div> </div> </div> <div class=\"p-a-md\"> <echart config=\"perStatusesConfig\" options=\"perStatusesOptions\"></echart> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/operation/_partials/service_groups_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Service Groups Summary\"> <h3>Service Groups Summary</h3> </div> <div class=\"box-tool p-t-sm\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('groups')\" csv-header=\"exports.groups.headers\" filename=\"service_groups_performance_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-7\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th ng-click=\"prepareServiceGroupVisualization('count')\" title=\"Area\"> Service Group </th> <th ng-click=\"prepareServiceGroupVisualization('count')\" title=\"Total Count of Service Requests\"> Total </th> <th ng-click=\"prepareServiceGroupVisualization('pending')\" title=\"Total Count of Pending Service Requests\"> Pending </th> <th ng-click=\"prepareServiceGroupVisualization('resolved')\" title=\"Total Count of Resolved Service Requests\"> Resolved </th> <th ng-click=\"prepareServiceGroupVisualization('late')\" title=\"Total Count of Service Requests Past SLA Resolve Time\"> Late </th> <th title=\"Average Time Taken to Attend a Customer(Call) Service Request\"> Average Attend Time </th> <th title=\"Average Time Taken to a Resolve Service Request\"> Average Resolve Time </th> </tr> </thead> <tbody> <tr ng-repeat=\"group in performances.groups\"> <td title=\"{{group.name}}\"> {{group.name}} </td> <td title=\"{{group.count | number:0}}\"> {{group.count | number:0}} </td> <td title=\" {{group.pending | number:0}}\"> {{group.pending | number:0}} </td> <td title=\" {{group.resolved | number:0}}\"> {{group.resolved | number:0}} </td> <td title=\" {{group.late | number:0}}\"> {{group.late | number:0}} </td> <td> <span> {{group.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> <span> {{group.averageAttendTime.seconds}} <span class=\"text-muted text-xs\">secs</span> </span> </td> <td> <span> {{group.averageResolveTime.hours + (group.averageResolveTime.days * 24)}} <span class=\"text-muted text-xs\">hrs</span> </span> <span> {{group.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </td> </tr> </tbody> </table> </div> <div class=\"col-sm-5 b-l lt\"> <div class=\"p-a-md\"> <echart config=\"perServiceGroupConfig\" options=\"perServiceGroupOptions\"></echart> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/operation/_partials/services_summary.html',
    " <div class=\"padding m-t-md m-b-lg\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Services Summary\"> <h3>Services Summary</h3> </div> <div class=\"box-tool\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('services')\" csv-header=\"exports.services.headers\" filename=\"services_performance_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-6 b-r lt\"> <div class=\"p-a-md\"> <echart config=\"perServiceConfig\" options=\"perServiceOptions\"></echart> </div> </div> <div class=\"col-sm-6\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th ng-click=\"prepareServiceVisualization('count')\" title=\"Area\"> Service </th> <th ng-click=\"prepareServiceVisualization('count')\" title=\"Total Count of Service Requests\"> Total </th> <th ng-click=\"prepareServiceVisualization('pending')\" title=\"Total Count of Pending Service Requests\"> Pending </th> <th ng-click=\"prepareServiceVisualization('resolved')\" title=\"Total Count of Resolved Service Requests\"> Resolved </th> <th ng-click=\"prepareServiceVisualization('late')\" title=\"Total Count of Service Requests Past SLA Resolve Time\"> Late </th> <th title=\"Average Time Taken to Attend a Customer(Call) Service Request\"> Average Attend Time </th> <th title=\"Average Time Taken to a Resolve Service Request\"> Average Resolve Time </th> </tr> </thead> <tbody> <tr ng-repeat=\"service in performances.services\"> <td title=\"{{service.name}}\"> {{service.name}} </td> <td title=\"{{service.count | number:0}}\"> {{service.count | number:0}} </td> <td title=\" {{service.pending | number:0}}\"> {{service.pending | number:0}} </td> <td title=\" {{service.resolved | number:0}}\"> {{service.resolved | number:0}} </td> <td title=\" {{service.late | number:0}}\"> {{service.late | number:0}} </td> <td> <span> {{service.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> <span> {{service.averageAttendTime.seconds}} <span class=\"text-muted text-xs\">secs</span> </span> </td> <td> <span> {{performances.overall.averageResolveTime.hours + (performances.overall.averageResolveTime.days * 24)}} <span class=\"text-muted text-xs\">hrs</span> </span> <span> {{service.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </td> </tr> </tbody> </table> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/operation/index.html',
    " <div class=\"app-header bg b-b bg-white\"> <div class=\"navbar\"> <div class=\"navbar-item pull-left h5 text-md\"> Operations - Reports </div> <ul class=\"nav navbar-nav pull-right\"> <li class=\"nav-item\"> <a ng-click=\"showFilter()\" class=\"nav-link\" aria-expanded=\"false\" title=\"Click to Filter Report\"> <i class=\"ion-android-funnel w-24\" title=\"Click To Filter Reports\"></i> </a> </li> </ul> </div> </div> <div class=\"app-body\"> <div class=\"app-body-inner\"> <ng-include ng-if=\"performances && performances.overall\" src=\"'views/dashboards/performance/_partials/jurisdiction_summary.html'\"></ng-include> <div class=\"row no-gutter\"> <div class=\"col-xs-12 col-sm-6 col-md-6\"> <ng-include ng-if=\"performances && performances.overall\" src=\"'views/dashboards/performance/_partials/overall_summary.html'\"></ng-include> </div> <div class=\"col-xs-12 col-sm-6 col-md-6\"> <ng-include ng-if=\"performances.statuses && performances.statuses.length > 0\" src=\"'views/dashboards/performance/_partials/pipeline_summary.html'\"></ng-include> </div> </div> <ng-include ng-if=\"performances.services  && performances.services.length > 0\" src=\"'views/dashboards/performance/_partials/services_summary.html'\"></ng-include> <ng-include ng-if=\"performances.services  && performances.services.length > 0\" src=\"'views/dashboards/operation/_partials/jurisdiction_zone_summary.html'\"></ng-include> <ng-include ng-if=\"performances.services  && performances.services.length > 0\" src=\"'views/dashboards/operation/_partials/material_used_summary.html'\"></ng-include> <div class=\"padding\" style=\"display: none\"> <div class=\"row m-t-lg\"> <div class=\"col-sm-12 col-md-5 col-lg-5\"> <ng-include ng-if=\"performances.operators\" src=\"'views/dashboards/_partials/service_request_leaderboard.html'\"></ng-include> </div> <div class=\"col-sm-12 col-md-5 col-lg-5 offset-md-1\"> <ng-include ng-if=\"performances.jurisdictions\" src=\"'views/dashboards/_partials/service_request_area_leaderboard.html'\"></ng-include> </div> </div> </div> <div ng-if=\"!performances.overall\" class=\"row-col h-v\"> <div class=\"row-cell v-m\"> <div class=\"text-center col-sm-6 offset-sm-3 p-y-lg\"> <p class=\"text-muted m-y-lg\"> No Data Found. Please update your filters. </p> <button ng-click=\"showFilter()\" class=\"btn btn-outline b-grey text-grey\" title=\"Click to update filters\"> Update Filters </button> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/overviews.html',
    " <div class=\"app-header bg b-b bg-white\"> <div class=\"navbar\"> <div class=\"navbar-item pull-left h5 text-md\"> Overview - Reports </div> <ul class=\"nav navbar-nav pull-right\"> <li class=\"nav-item\"> <a ng-click=\"showFilter()\" class=\"nav-link\" aria-expanded=\"false\" title=\"Click to Filter Report\"> <i class=\"ion-android-funnel w-24\" title=\"Click To Filter Reports\"></i> </a> </li> <li class=\"nav-item\" ng-if=\"overviews && overviews.length > 0\"> <a title=\"Click To Export Reports\" class=\"nav-link\" ng-csv=\"export\" csv-header=\"exports.headers\" filename=\"overviews.csv\"> <i class=\"icon-cloud-download w-24\" title=\"Click To Export Reports\"></i> </a> </li> </ul> </div> </div> <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"padding\"> <div> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Service Group</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Service Group </small> </div> <div class=\"box-body p-l-none p-r-none\"> <echart config=\"perGroupConfig\" options=\"perGroupOptions\"></echart> </div> </div> </div> </div> </div> <div> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Service</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Service </small> </div> <div class=\"box-body p-l-none p-r-none\"> <echart ng-repeat=\"options in perPerServiceOptions\" config=\"perPerServiceConfig\" options=\"options\"></echart> </div> </div> </div> </div> </div> <div> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Status</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Status </small> </div> <div class=\"box-body p-l-none p-r-none\"> <echart config=\"perStatusConfig\" options=\"perStatusOptions\"></echart> </div> </div> </div> </div> </div> <div> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Priority</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Priorities </small> </div> <div class=\"box-body p-l-none p-r-none\"> <echart config=\"perPriorityConfig\" options=\"perPriorityOptions\"></echart> </div> </div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/overviews/_partials/jurisdictions_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Areas Summary\"> <h3>Areas Summary</h3> </div> <div class=\"box-tool p-t-sm\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('jurisdictions')\" csv-header=\"exports.jurisdictions.headers\" filename=\"jurisdictions_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-5 b-r lt\"> <div class=\"p-a-md\"> <echart config=\"perJurisdictionConfig\" options=\"perJurisdictionOptions\"></echart> </div> </div> <div class=\"col-sm-7\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th ng-click=\"prepareJurisdictionVisualization('count')\" title=\"Area\"> Area </th> <th ng-click=\"prepareJurisdictionVisualization('count')\" title=\"Total Count of Service Requests\"> Total </th> <th ng-click=\"prepareJurisdictionVisualization('pending')\" title=\"Total Count of Pending Service Requests\"> Pending </th> <th ng-click=\"prepareJurisdictionVisualization('resolved')\" title=\"Total Count of Resolved Service Requests\"> Resolved </th> <th ng-click=\"prepareJurisdictionVisualization('late')\" title=\"Total Count of Service Requests Past SLA Resolve Time\"> Late </th> <th title=\"Average Time Taken to Attend a Customer(Call) Service Request\"> Average Attend Time </th> <th title=\"Average Time Taken to a Resolve Service Request\"> Average Resolve Time </th> </tr> </thead> <tbody> <tr ng-repeat=\"jurisdiction in overviews.jurisdictions\" ui-sref=\"app.performances({jurisdiction:jurisdiction,startedAt:filters.startedAt,endedAt:filters.endedAt})\"> <td title=\"{{jurisdiction.name}}\"> {{jurisdiction.name}} </td> <td title=\"{{jurisdiction.count | number:0}}\"> {{jurisdiction.count | number:0}} </td> <td title=\" {{jurisdiction.pending | number:0}}\"> {{jurisdiction.pending | number:0}} </td> <td title=\" {{jurisdiction.resolved | number:0}}\"> {{jurisdiction.resolved | number:0}} </td> <td title=\" {{jurisdiction.late | number:0}}\"> {{jurisdiction.late | number:0}} </td> <td> <span> {{jurisdiction.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> <span> {{jurisdiction.averageAttendTime.seconds}} <span class=\"text-muted text-xs\">secs</span> </span> </td> <td> <span> {{jurisdiction.averageResolveTime.hours + (jurisdiction.averageResolveTime.days * 24)}} <span class=\"text-muted text-xs\">hrs</span> </span> <span> {{jurisdiction.averageResolveTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </td> </tr> </tbody> </table> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/overviews/_partials/methods_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Reporting Methods Summary\"> <h3>Reporting Methods Summary</h3> </div> <div class=\"box-tool p-t-sm\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('methods')\" csv-header=\"exports.methods.headers\" filename=\"methods_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-5 b-r lt\"> <div class=\"p-a-md\"> <echart config=\"perMethodConfig\" options=\"perMethodOptions\"></echart> </div> </div> <div class=\"col-sm-7\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th ng-click=\"prepareMethodVisualization('count')\" title=\"Reporting Method\"> Method </th> <th ng-click=\"prepareMethodVisualization('count')\" title=\"Total Count of Service Requests\"> Total </th> </tr> </thead> <tbody> <tr ng-repeat=\"method in overviews.methods\"> <td title=\"{{method.name}}\"> {{method.name}} </td> <td title=\"{{method.count | number:0}}\"> {{method.count | number:0}} </td> </tr> </tbody> </table> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/overviews/_partials/overall_summary.html',
    " <div class=\"row no-gutter\"> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Total Service Requests\"> <div class=\"padding\"> <div class=\"text-center\"> <h2 class=\"text-center _600 m-t-md\"> {{overviews.overall.count | number:0}} </h2> <p class=\"text-muted m-b-md\">Total</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Pending Service Requests\"> <div class=\"padding\"> <div> <span class=\"pull-right\" ng-class=\"overviews.overall.percentagePending <= 50 ? 'text-success' : 'text-danger'\">{{overviews.overall.percentagePending | number:2}}%</span> </div> <div class=\"text-center\"> <h2 class=\"text-center _600 m-t-md\"> {{overviews.overall.pending | number:0}} </h2> <p class=\"text-muted m-b-md\">Pending</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Resolved Service Requests\"> <div class=\"padding\"> <div> <span class=\"pull-right\" ng-class=\"overviews.overall.percentageResolved >= 50 ? 'text-success' : 'text-danger'\">{{overviews.overall.percentageResolved | number:2}}%</span> </div> <div class=\"text-center\"> <h2 class=\"text-center _600 m-t-md\"> {{overviews.overall.resolved | number:0}} </h2> <p class=\"text-muted m-b-md\">Resolved</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Late(Past SLA Time) Service Requests\"> <div class=\"padding\"> <div> <span class=\"pull-right\" ng-class=\"overviews.overall.percentageLate > 0 ? 'text-danger' : 'text-success'\">{{overviews.overall.percentageLate | number:2}}%</span> </div> <div class=\"text-center\"> <h2 class=\"text-center _600 m-t-md\"> {{overviews.overall.late | number:0}} </h2> <p class=\"text-muted m-b-md\">Late</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Average Attend Time(Call Duration)\"> <div class=\"padding\"> <div class=\"text-center\"> <h2 class=\"text-center _600 m-t-md\"> <span title=\"Average Attend Time(Call Duration) - Minutes Spent\"> {{overviews.overall.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> <span title=\"Average Attend Time(Call Duration) - Seconds Spent\"> {{overviews.overall.averageAttendTime.seconds}} <span class=\"text-muted text-xs\">secs</span> </span> </h2> <p class=\"text-muted m-b-md\">Average Attend Time</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-b\" title=\"Average resolve Time\"> <div class=\"padding\"> <div class=\"text-center\"> <h2 class=\"text-center _600 m-t-md\"> <span title=\"Average resolve Time - Hourss Spent\"> {{overviews.overall.averageResolveTime.hours + (overviews.overall.averageResolveTime.days * 24)}} <span class=\"text-muted text-xs\">hrs</span> </span> <span title=\"Average resolve Time - Minutes Spent\"> {{overviews.overall.averageResolveTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </h2> <p class=\"text-muted m-b-md\">Average Resolve Time</p> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/overviews/_partials/service_groups_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Areas Summary\"> <h3>Service Groups Summary</h3> </div> <div class=\"box-tool p-t-sm\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('groups')\" csv-header=\"exports.groups.headers\" filename=\"service_groups_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-7\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th ng-click=\"prepareServiceGroupVisualization('count')\" title=\"Area\"> Service Group </th> <th ng-click=\"prepareServiceGroupVisualization('count')\" title=\"Total Count of Service Requests\"> Total </th> <th ng-click=\"prepareServiceGroupVisualization('pending')\" title=\"Total Count of Pending Service Requests\"> Pending </th> <th ng-click=\"prepareServiceGroupVisualization('resolved')\" title=\"Total Count of Resolved Service Requests\"> Resolved </th> <th ng-click=\"prepareServiceGroupVisualization('late')\" title=\"Total Count of Service Requests Past SLA Resolve Time\"> Late </th> <th title=\"Average Time Taken to Attend a Customer(Call) Service Request\"> Average Attend Time </th> <th title=\"Average Time Taken to a Resolve Service Request\"> Average Resolve Time </th> </tr> </thead> <tbody> <tr ng-repeat=\"group in overviews.groups\"> <td title=\"{{group.name}}\"> {{group.name}} </td> <td title=\"{{group.count | number:0}}\"> {{group.count | number:0}} </td> <td title=\" {{group.pending | number:0}}\"> {{group.pending | number:0}} </td> <td title=\" {{group.resolved | number:0}}\"> {{group.resolved | number:0}} </td> <td title=\" {{group.late | number:0}}\"> {{group.late | number:0}} </td> <td> <span> {{group.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> <span> {{group.averageAttendTime.seconds}} <span class=\"text-muted text-xs\">secs</span> </span> </td> <td> <span> {{group.averageResolveTime.hours + (group.averageResolveTime.days * 24)}} <span class=\"text-muted text-xs\">hrs</span> </span> <span> {{group.averageResolveTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </td> </tr> </tbody> </table> </div> <div class=\"col-sm-5 b-l lt\"> <div class=\"p-a-md\"> <echart config=\"perServiceGroupConfig\" options=\"perServiceGroupOptions\"></echart> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/overviews/_partials/services_summary.html',
    " <div class=\"padding m-t-md m-b-lg\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Areas Summary\"> <h3>Services Summary</h3> </div> <div class=\"box-tool\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('services')\" csv-header=\"exports.services.headers\" filename=\"services_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-6 b-r lt\"> <div class=\"p-a-md\"> <echart config=\"perServiceConfig\" options=\"perServiceOptions\"></echart> </div> </div> <div class=\"col-sm-6\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th ng-click=\"prepareServiceVisualization('count')\" title=\"Area\"> Service </th> <th ng-click=\"prepareServiceVisualization('count')\" title=\"Total Count of Service Requests\"> Total </th> <th ng-click=\"prepareServiceVisualization('pending')\" title=\"Total Count of Pending Service Requests\"> Pending </th> <th ng-click=\"prepareServiceVisualization('resolved')\" title=\"Total Count of Resolved Service Requests\"> Resolved </th> <th ng-click=\"prepareServiceVisualization('late')\" title=\"Total Count of Service Requests Past SLA Resolve Time\"> Late </th> <th title=\"Average Time Taken to Attend a Customer(Call) Service Request\"> Average Attend Time </th> <th title=\"Average Time Taken to a Resolve Service Request\"> Average Resolve Time </th> </tr> </thead> <tbody> <tr ng-repeat=\"service in overviews.services\"> <td title=\"{{service.name}}\"> {{service.name}} </td> <td title=\"{{service.count | number:0}}\"> {{service.count | number:0}} </td> <td title=\" {{service.pending | number:0}}\"> {{service.pending | number:0}} </td> <td title=\" {{service.resolved | number:0}}\"> {{service.resolved | number:0}} </td> <td title=\" {{service.late | number:0}}\"> {{service.late | number:0}} </td> <td> <span> {{service.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> <span> {{service.averageAttendTime.seconds}} <span class=\"text-muted text-xs\">secs</span> </span> </td> <td> <span> {{service.averageResolveTime.hours + (service.averageResolveTime.days * 24)}} <span class=\"text-muted text-xs\">hrs</span> </span> <span> {{service.averageResolveTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </td> </tr> </tbody> </table> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/overviews/_partials/workspaces_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Reporting Workspaces Summary\"> <h3>Workspaces Summary</h3> </div> <div class=\"box-tool p-t-sm\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('workspaces')\" csv-header=\"exports.workspaces.headers\" filename=\"workspaces_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-7\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th ng-click=\"prepareWorkspaceVisualization('count')\" title=\"Workspace\"> Workspace </th> <th ng-click=\"prepareWorkspaceVisualization('count')\" title=\"Total Count of Service Requests\"> Total </th> </tr> </thead> <tbody> <tr ng-repeat=\"workspace in overviews.workspaces\"> <td title=\"{{workspace.name}}\"> {{workspace.name}} </td> <td title=\"{{workspace.count | number:0}}\"> {{workspace.count | number:0}} </td> </tr> </tbody> </table> </div> <div class=\"col-sm-5 b-l lt\"> <div class=\"p-a-md\"> <echart config=\"perWorkspaceConfig\" options=\"perWorkspaceOptions\"></echart> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/overviews/index.html',
    " <div class=\"app-header bg b-b bg-white\"> <div class=\"navbar\"> <div class=\"navbar-item pull-left h5 text-md\"> Overview - Reports </div> <ul class=\"nav navbar-nav pull-right\"> <li class=\"nav-item\"> <a ng-click=\"showFilter()\" class=\"nav-link\" aria-expanded=\"false\" title=\"Click to Filter Report\"> <i class=\"ion-android-funnel w-24\" title=\"Click To Filter Reports\"></i> </a> </li> </ul> </div> </div> <div class=\"app-body\"> <div class=\"app-body-inner\"> <ng-include ng-if=\"overviews.overall\" src=\"'views/dashboards/overviews/_partials/overall_summary.html'\"></ng-include> <ng-include ng-if=\"overviews.jurisdictions && overviews.jurisdictions.length > 1\" src=\"'views/dashboards/overviews/_partials/jurisdictions_summary.html'\"></ng-include> <ng-include ng-if=\"overviews.groups && overviews.groups.length > 0\" src=\"'views/dashboards/overviews/_partials/service_groups_summary.html'\"></ng-include> <ng-include ng-if=\"overviews.services  && overviews.services.length > 0\" src=\"'views/dashboards/overviews/_partials/services_summary.html'\"></ng-include> <ng-include ng-if=\"overviews.methods  && overviews.methods.length > 0\" src=\"'views/dashboards/overviews/_partials/methods_summary.html'\"></ng-include> <ng-include ng-if=\"overviews.workspaces  && overviews.workspaces.length > 0\" src=\"'views/dashboards/overviews/_partials/workspaces_summary.html'\"></ng-include> <div ng-if=\"!overviews.overall\" class=\"row-col h-v\"> <div class=\"row-cell v-m\"> <div class=\"text-center col-sm-6 offset-sm-3 p-y-lg\"> <p class=\"text-muted m-y-lg\"> No Data Found. Please update your filters. </p> <button ng-click=\"showFilter()\" class=\"btn btn-outline b-grey text-grey\" title=\"Click to update filters\"> Update Filters </button> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/performance/_partials/average_time_summary.html',
    " <div class=\"row no-gutter\"> <div class=\"col-xs-6 col-sm-6 b-a\" title=\"Average Attend Time(Call Duration)\"> <div> <div class=\"text-center\"> <h2 class=\"text-center _600 m-t-md\"> <span title=\"Average Attend Time(Call Duration) - Minutes Spent\"> {{performances.overall.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> <span title=\"Average Attend Time(Call Duration) - Seconds Spent\"> {{performances.overall.averageAttendTime.seconds}} <span class=\"text-muted text-xs\">secs</span> </span> </h2> <p class=\"text-muted m-b-md\">Average Attend Time</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-6 b-b b-t b-r\" title=\"Average resolve Time\"> <div> <div class=\"text-center\"> <h2 class=\"text-center _600 m-t-md\"> <span title=\"Average resolve Time - Days Spent\"> {{performances.overall.averageResolveTime.days}} <span class=\"text-muted text-xs\">days</span> </span> <span title=\"Average resolve Time - Hours Spent\"> {{performances.overall.averageResolveTime.hours}} <span class=\"text-muted text-xs\">hrs</span> </span> <span title=\"Average resolve Time - Minutes Spent\"> {{performances.overall.averageResolveTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </h2> <p class=\"text-muted m-b-md\">Average Resolve Time</p> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/performance/_partials/jurisdiction_summary.html',
    " <div class=\"item\"> <div class=\"p-a-lg\"> <div class=\"row m-t\"> <div class=\"col-sm-12 col-md-6 col-lg-6\"> <a href=\"#\" class=\"pull-left m-r-md\"> <span> <letter-avatar title=\"{{jurisdiction.name}}\" data=\"{{jurisdiction.name}}\" height=\"96\" width=\"96\" shape=\"round\"> </letter-avatar> <i class=\"on b-white\"></i> </span> </a> <div class=\"clear m-b\"> <h4 class=\"m-a-0 m-b-sm\" title=\"Name\">{{jurisdiction.name}}</h4> <div class=\"block clearfix m-t-md m-b\"> <span> <a href=\"\" class=\"btn btn-icon btn-social rounded b-a btn-sm\"> <i class=\"icon-phone\"></i> <i class=\"icon-phone indigo\"></i> </a> <span title=\"Phone Number\" class=\"text-muted\"> {{jurisdiction.phone ? jurisdiction.phone : 'N/A'}} </span> </span> <span class=\"m-l-md\"> <a href=\"\" class=\"btn btn-icon btn-social rounded b-a btn-sm\"> <i class=\"icon-envelope\"></i> <i class=\"icon-envelope light-blue\"></i> </a> <span title=\"Email Address\" class=\"text-muted\"> {{jurisdiction.email ? jurisdiction.email : 'N/A'}} </span> </span> </div> </div> </div> <div class=\"col-sm-12 col-md-6 col-lg-6 pull-right\"> <ng-include src=\"'views/dashboards/performance/_partials/average_time_summary.html'\"></ng-include> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/performance/_partials/overall_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Overview Summary\"> <h3>Overview Summary</h3> </div> <div class=\"box-tool\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('services')\" csv-header=\"exports.services.headers\" filename=\"services_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row no-gutter\"> <div class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"Total Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.count | number:0}} </h4> <p class=\"text-muted m-b-md\">Total</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Pending Service Requests\"> <div class=\"p-a-sm\"> <div> <span class=\"pull-right text-xs\" ng-class=\"performances.overall.percentagePending <= 50 ? 'text-success' : 'text-danger'\">{{performances.overall.percentagePending | number:2}}%</span> </div> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.pending | number:0}} </h4> <p class=\"text-muted m-b-md\">Pending</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Resolved Service Requests\"> <div class=\"p-a-sm\"> <div> <span class=\"pull-right text-xs\" ng-class=\"performances.overall.percentageResolved >= 50 ? 'text-success' : 'text-danger'\">{{performances.overall.percentageResolved | number:2}}%</span> </div> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.resolved | number:0}} </h4> <p class=\"text-muted m-b-md\">Resolved</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-2 b-r b-b\" title=\"Late(Past SLA Time) Service Requests\"> <div class=\"p-a-sm\"> <div> <span class=\"pull-right text-xs\" ng-class=\"performances.overall.percentageLate > 0 ? 'text-danger' : 'text-success'\">{{performances.overall.percentageLate | number:2}}%</span> </div> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.late | number:0}} </h4> <p class=\"text-muted m-b-md\">Late</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-b\" title=\"Late(Past SLA Time) Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{performances.overall.late | number:0}} </h4> <p class=\"text-muted m-b-md\">Escallated</p> </div> </div> </div> </div> <div class=\"p-a-md\"> <echart config=\"perSummaryConfig\" options=\"perSummaryOptions\"></echart> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/performance/_partials/pipeline_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Work Pipeline\"> <h3>Work Pipeline</h3> </div> <div class=\"box-tool\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('services')\" csv-header=\"exports.services.headers\" filename=\"services_overview_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row no-gutter\"> <div ng-repeat=\"status in performances.statuses\" class=\"col-xs-6 col-sm-3 b-r b-b\" title=\"{{status.name}} Service Requests\"> <div class=\"p-a-sm\"> <div class=\"text-center\"> <h4 class=\"text-center _600 m-t-md\"> {{status.count}} </h4> <p class=\"text-muted m-b-md\"> {{status.name}} </p> </div> </div> </div> </div> <div class=\"p-a-md\"> <echart config=\"perStatusesConfig\" options=\"perStatusesOptions\"></echart> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/performance/_partials/service_groups_summary.html',
    " <div class=\"padding m-t-md\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Service Groups Summary\"> <h3>Service Groups Summary</h3> </div> <div class=\"box-tool p-t-sm\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('groups')\" csv-header=\"exports.groups.headers\" filename=\"service_groups_performance_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-7\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th ng-click=\"prepareServiceGroupVisualization('count')\" title=\"Area\"> Service Group </th> <th ng-click=\"prepareServiceGroupVisualization('count')\" title=\"Total Count of Service Requests\"> Total </th> <th ng-click=\"prepareServiceGroupVisualization('pending')\" title=\"Total Count of Pending Service Requests\"> Pending </th> <th ng-click=\"prepareServiceGroupVisualization('resolved')\" title=\"Total Count of Resolved Service Requests\"> Resolved </th> <th ng-click=\"prepareServiceGroupVisualization('late')\" title=\"Total Count of Service Requests Past SLA Resolve Time\"> Late </th> <th title=\"Average Time Taken to Attend a Customer(Call) Service Request\"> Average Attend Time </th> <th title=\"Average Time Taken to a Resolve Service Request\"> Average Resolve Time </th> </tr> </thead> <tbody> <tr ng-repeat=\"group in performances.groups\"> <td title=\"{{group.name}}\"> {{group.name}} </td> <td title=\"{{group.count | number:0}}\"> {{group.count | number:0}} </td> <td title=\" {{group.pending | number:0}}\"> {{group.pending | number:0}} </td> <td title=\" {{group.resolved | number:0}}\"> {{group.resolved | number:0}} </td> <td title=\" {{group.late | number:0}}\"> {{group.late | number:0}} </td> <td> <span> {{group.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> <span> {{group.averageAttendTime.seconds}} <span class=\"text-muted text-xs\">secs</span> </span> </td> <td> <span> {{group.averageResolveTime.hours + (group.averageResolveTime.days * 24)}} <span class=\"text-muted text-xs\">hrs</span> </span> <span> {{group.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </td> </tr> </tbody> </table> </div> <div class=\"col-sm-5 b-l lt\"> <div class=\"p-a-md\"> <echart config=\"perServiceGroupConfig\" options=\"perServiceGroupOptions\"></echart> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/performance/_partials/services_summary.html',
    " <div class=\"padding m-t-md m-b-lg\"> <div class=\"box b-a p-l-0\"> <div class=\"box-header b-b p-t-md p-b-md\" title=\"Services Summary\"> <h3>Services Summary</h3> </div> <div class=\"box-tool\"> <ul class=\"nav\"> <li class=\"nav-item inline\"> <a title=\"Click To Export\" class=\"btn btn-xs rounded white\" aria-expanded=\"false\" ng-csv=\"export('services')\" csv-header=\"exports.services.headers\" filename=\"services_performance_reports_{{filters.startedAt | date:settings.dateFormat}}_{{filters.endedAt | date:settings.dateFormat}}.csv\"> Export </a> </li> <li uib-dropdown class=\"nav-item inline dropdown\" style=\"display:none\"> <a uib-dropdown-toggle class=\"btn btn-xs rounded white dropdown-toggle\" aria-expanded=\"false\">Today</a> <div uib-dropdown-menu class=\"dropdown-menu dropdown-menu-scale pull-right\"> <a class=\"dropdown-item\" href=\"\">Last 24 hours</a> <a class=\"dropdown-item\" href=\"\">Last 7 days</a> <a class=\"dropdown-item\" href=\"\">Last month</a> <a class=\"dropdown-item\" href=\"\">Last Year</a> <div class=\"dropdown-divider\"></div> <a class=\"dropdown-item\">Today</a> </div> </li> </ul> </div> <div> <div class=\"row-col\"> <div class=\"col-sm-6 b-r lt\"> <div class=\"p-a-md\"> <echart config=\"perServiceConfig\" options=\"perServiceOptions\"></echart> </div> </div> <div class=\"col-sm-6\"> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th ng-click=\"prepareServiceVisualization('count')\" title=\"Area\"> Service </th> <th ng-click=\"prepareServiceVisualization('count')\" title=\"Total Count of Service Requests\"> Total </th> <th ng-click=\"prepareServiceVisualization('pending')\" title=\"Total Count of Pending Service Requests\"> Pending </th> <th ng-click=\"prepareServiceVisualization('resolved')\" title=\"Total Count of Resolved Service Requests\"> Resolved </th> <th ng-click=\"prepareServiceVisualization('late')\" title=\"Total Count of Service Requests Past SLA Resolve Time\"> Late </th> <th title=\"Average Time Taken to Attend a Customer(Call) Service Request\"> Average Attend Time </th> <th title=\"Average Time Taken to a Resolve Service Request\"> Average Resolve Time </th> </tr> </thead> <tbody> <tr ng-repeat=\"service in performances.services\"> <td title=\"{{service.name}}\"> {{service.name}} </td> <td title=\"{{service.count | number:0}}\"> {{service.count | number:0}} </td> <td title=\" {{service.pending | number:0}}\"> {{service.pending | number:0}} </td> <td title=\" {{service.resolved | number:0}}\"> {{service.resolved | number:0}} </td> <td title=\" {{service.late | number:0}}\"> {{service.late | number:0}} </td> <td> <span> {{service.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> <span> {{service.averageAttendTime.seconds}} <span class=\"text-muted text-xs\">secs</span> </span> </td> <td> <span> {{performances.overall.averageResolveTime.hours + (performances.overall.averageResolveTime.days * 24)}} <span class=\"text-muted text-xs\">hrs</span> </span> <span> {{service.averageAttendTime.minutes}} <span class=\"text-muted text-xs\">mins</span> </span> </td> </tr> </tbody> </table> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/performance/index.html',
    " <div class=\"app-header bg b-b bg-white\"> <div class=\"navbar\"> <div class=\"navbar-item pull-left h5 text-md\"> Performance </div> <ul class=\"nav navbar-nav pull-right\"> <li class=\"nav-item\"> <a ng-click=\"showFilter()\" class=\"nav-link\" aria-expanded=\"false\" title=\"Click to Filter Report\"> <i class=\"ion-android-funnel w-24\" title=\"Click To Filter Reports\"></i> </a> </li> </ul> </div> </div> <div class=\"app-body\"> <div class=\"app-body-inner\"> <ng-include ng-if=\"performances && performances.overall\" src=\"'views/dashboards/performance/_partials/jurisdiction_summary.html'\"></ng-include> <div class=\"row no-gutter\"> <div class=\"col-xs-12 col-sm-6 col-md-6\"> <ng-include ng-if=\"performances && performances.overall\" src=\"'views/dashboards/performance/_partials/overall_summary.html'\"></ng-include> </div> <div class=\"col-xs-12 col-sm-6 col-md-6\"> <ng-include ng-if=\"performances.statuses && performances.statuses.length > 0\" src=\"'views/dashboards/performance/_partials/pipeline_summary.html'\"></ng-include> </div> </div> <ng-include ng-if=\"performances.groups && performances.groups.length > 0\" src=\"'views/dashboards/performance/_partials/service_groups_summary.html'\"></ng-include> <ng-include ng-if=\"performances.services  && performances.services.length > 0\" src=\"'views/dashboards/performance/_partials/services_summary.html'\"></ng-include> <div class=\"padding\" style=\"display: none\"> <div class=\"row m-t-lg\"> <div class=\"col-sm-12 col-md-5 col-lg-5\"> <ng-include ng-if=\"performances.operators\" src=\"'views/dashboards/_partials/service_request_leaderboard.html'\"> </div> <div class=\"col-sm-12 col-md-5 col-lg-5 offset-md-1\"> <ng-include ng-if=\"performances.jurisdictions\" src=\"'views/dashboards/_partials/service_request_area_leaderboard.html'\"> </div> </div> </div> <div ng-if=\"!performances.overall\" class=\"row-col h-v\"> <div class=\"row-cell v-m\"> <div class=\"text-center col-sm-6 offset-sm-3 p-y-lg\"> <p class=\"text-muted m-y-lg\"> No Data Found. Please update your filters. </p> <button ng-click=\"showFilter()\" class=\"btn btn-outline b-grey text-grey\" title=\"Click to update filters\"> Update Filters </button> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/performances.html',
    " <div class=\"app-header bg b-b bg-white\"> <div class=\"navbar\"> <div class=\"navbar-item pull-left h5 text-md\"> Performance </div> </div> </div> <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"padding\"> <div class=\"row m-b-lg m-t-lg\"> <div class=\"col-sm-12 col-md-6 col-lg-6\"> <ng-include src=\"'views/dashboards/_partials/service_request_summaries.html'\"></ng-include> </div> <div class=\"col-sm-12 col-md-6 col-lg-6\"> <ng-include src=\"'views/dashboards/_partials/service_request_pipelines.html'\"></ng-include> </div> </div> <hr> <div class=\"row m-t-lg\"> <div class=\"col-sm-12 col-md-5 col-lg-5\"> <ng-include ng-if=\"performances.operators\" src=\"'views/dashboards/_partials/service_request_leaderboard.html'\"> </div> <div class=\"col-sm-12 col-md-5 col-lg-5 offset-md-1\"> <ng-include ng-if=\"performances.jurisdictions\" src=\"'views/dashboards/_partials/service_request_area_leaderboard.html'\"> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/standings.html',
    " <div class=\"app-header bg b-b bg-white\"> <div class=\"navbar\"> <div class=\"navbar-item pull-left h5 text-md\"> Standing - Reports </div> <ul class=\"nav navbar-nav pull-right\"> <li class=\"nav-item\"> <a ng-click=\"showFilter()\" class=\"nav-link\" aria-expanded=\"false\" title=\"Click to Filter Report\"> <i class=\"ion-android-funnel w-24\" title=\"Click To Filter Reports\"></i> </a> </li> <li class=\"nav-item\" ng-if=\"standings && standings.length > 0\"> <a title=\"Click To Export Reports\" class=\"nav-link\" ng-csv=\"export\" csv-header=\"exports.headers\" filename=\"standings.csv\"> <i class=\"icon-cloud-download w-24\" title=\"Click To Export Reports\"></i> </a> </li> </ul> </div> </div> <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"padding\"> <div> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Area - Work Load</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Area </small> </div> <div class=\"box-body p-l-none p-r-none\"> <echart config=\"perJurisdictionConfig\" options=\"perJurisdictionOptions\"></echart> </div> </div> </div> </div> </div> <div> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3> Issue per Area per Service Group - Affected Business Units(Divisions) </h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Area and Service Group </small> </div> <div class=\"box-body p-l-none p-r-none\"> <echart config=\"perJurisdictionPerServiceGroupConfig\" options=\"perJurisdictionPerServiceGroupOptions\"></echart> </div> </div> </div> </div> </div> <div> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Area per Service - Impacted Business Services</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Area and Service </small> </div> <div class=\"box-body p-l-none p-r-none\"> <echart ng-repeat=\"options in perJurisdictionPerServiceOptions\" config=\"perJurisdictionPerServiceConfig\" options=\"options\"></echart> </div> </div> </div> </div> </div> <div> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Area per Priority - Work Severity</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Area and Priority </small> </div> <div class=\"box-body p-l-none p-r-none\"> <echart config=\"perJurisdictionPerPriorityConfig\" options=\"perJurisdictionPerPriorityOptions\"></echart> </div> </div> </div> </div> </div> <div> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Area per Status - Work Progress</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Area and Status </small> </div> <div class=\"box-body p-l-none p-r-none\"> <echart config=\"perJurisdictionPerStatusConfig\" options=\"perJurisdictionPerStatusOptions\"></echart> </div> </div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/items/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Item Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Item\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit && item._id\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted no-border\" title=\"Click to edit item\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"save()\" class=\"nav-link text-muted no-border\" title=\"Click to save item\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/items/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/items/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"itemForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Item Code\"> <div class=\"form-group\"> <label title=\"Item Code\" class=\"floating-label\">Code</label> <input title=\"Item Code\" ng-disabled=\"!edit\" ng-model=\"item.code\" ng-required ng-minlength=\"1\" type=\"text\" name=\"code\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Item Name\"> <div class=\"form-group\"> <label title=\"Item Name\" class=\"floating-label\">Name</label> <input title=\"Item Name\" ng-disabled=\"!edit\" ng-model=\"item.name.en\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Item Unit\"> <div class=\"form-group\"> <label title=\"Item Unit\" class=\"floating-label\">Unit</label> <input title=\"Item Unit\" ng-disabled=\"!edit\" ng-model=\"item.properties.unit\" ng-required ng-minlength=\"2\" type=\"text\" name=\"unit\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Item Color\"> <div class=\"m-t-lg\"> <div class=\"form-group\"> <label title=\"Item Color\" class=\"floating-label\">Item Color(HEX)</label> <color-picker ng-model=\"item.color\" options=\"colorPickerOptions\"> </color-picker> </div> </div> </div> <div class=\"m-t-lg\" title=\"Item Description\"> <div class=\"form-group\"> <label class=\"floating-label\">Description</label> <textarea title=\"Item Description\" ng-disabled=\"!edit\" ng-model=\"item.description.en\" msd-elastic name=\"description\" class=\"form-control\" rows=\"3\">\n" +
    "                    </textarea> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/items/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Items ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(item)\" class=\"list-item list-item-padded\" ng-repeat=\"item in items\" title=\"{{item.description.en}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Item Code\" data=\"{{item.code}}\" height=\"60\" width=\"60\" color=\"{{item.color}}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Item Code\" class=\"pull-right text-xs text-muted\"> {{item.code}} </span> <div class=\"item-title\"> <span title=\"Item Name\" class=\"_500\">{{item.name.en}}</span> </div> <p title=\"Item Description\" class=\"block text-muted text-ellipsis\"> {{item.description.en}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"></div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/jurisdictions/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Jurisdiction Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Jurisdiction\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit && jurisdiction._id\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted no-border\" title=\"Click to edit jurisdiction\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"save()\" class=\"nav-link text-muted no-border\" title=\"Click to save jurisdiction\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/jurisdictions/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/jurisdictions/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"jurisdictionForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div title=\"Jurisdiction Name\"> <div class=\"form-group\"> <label title=\"Jurisdiction Code\" class=\"floating-label\">Code</label> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.code\" ng-required ng-minlength=\"1\" type=\"text\" name=\"code\" class=\"form-control\"> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6\" title=\"Jurisdiction Name\"> <div class=\"form-group\"> <label title=\"Jurisdiction Name\" class=\"floating-label\">Name</label> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> </div> <div class=\"col-sm-6\" title=\"Jurisdiction Phone\"> <div class=\"form-group\"> <label title=\"Mobile Phone Number\" class=\"floating-label\">Phone</label> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.phone\" ng-required ng-minlength=\"2\" type=\"text\" name=\"phone\" class=\"form-control\"> </div> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-12\" title=\"Jurisdiction Email\"> <div class=\"form-group\"> <label title=\"Email Address\" class=\"floating-label\">Email</label> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.email\" ng-required ng-minlength=\"2\" type=\"text\" name=\"email\" class=\"form-control\"> </div> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-12\" title=\"Jurisdiction Website\"> <div class=\"form-group\"> <label title=\"Website URL\" class=\"floating-label\">Website</label> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.website\" ng-required ng-minlength=\"2\" type=\"text\" name=\"website\" class=\"form-control\"> </div> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6\" title=\"Jurisdiction Longitude\"> <div class=\"form-group\"> <label title=\"Longitude\" class=\"floating-label\">Longitude</label> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.longitude\" ng-required type=\"number\" name=\"longitude\" class=\"form-control\"> </div> </div> <div class=\"col-sm-6\" title=\"Jurisdiction Latitude\"> <div class=\"form-group\"> <label title=\"Latitude\" class=\"floating-label\">Latitude</label> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.latitude\" ng-required type=\"number\" name=\"latitude\" class=\"form-control\"> </div> </div> </div> <div class=\"m-t-lg\" title=\"Jurisdiction Details\"> <div class=\"form-group\"> <label class=\"floating-label\">About</label> <textarea ng-disabled=\"!edit\" ng-model=\"jurisdiction.about\" msd-elastic name=\"about\" class=\"form-control\" rows=\"2\">\n" +
    "                    </textarea> </div> </div> <div class=\"m-t-lg\" title=\"Jurisdiction Physical Address\"> <div class=\"form-group\"> <label class=\"floating-label\">Physical Address</label> <textarea ng-disabled=\"!edit\" ng-model=\"jurisdiction.address\" msd-elastic name=\"about\" class=\"form-control\" rows=\"2\">\n" +
    "                    </textarea> </div> </div> <div class=\"m-t-lg\" title=\"Jurisdiction Color\"> <div class=\"m-t-lg\"> <div class=\"form-group\"> <label title=\"Jurisdiction Color\" class=\"floating-label\">Jurisdiction Color(HEX)</label> <color-picker ng-model=\"jurisdiction.color\" options=\"colorPickerOptions\"> </color-picker> </div> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/jurisdictions/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Jurisdictions ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(jurisdiction)\" class=\"list-item list-item-padded\" ng-repeat=\"jurisdiction in jurisdictions\" title=\"{{jurisdiction.about}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Jurisdiction Code\" data=\"{{jurisdiction.code}}\" height=\"60\" width=\"60\" color=\"{{jurisdiction.color}}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Jurisdiction Phone Number\" class=\"pull-right text-xs text-muted\"> {{jurisdiction.phone}} </span> <div class=\"item-title\"> <span title=\"Jurisdiction Name\" class=\"_500\">{{jurisdiction.name}}</span> </div> <p title=\"Jurisdiction Details\" class=\"block text-muted text-ellipsis\"> {{jurisdiction.about}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"></div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/manage/main.html',
    " <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"row-col\"> <div ng-include=\"'views/manage/side_subnav.html'\" class=\"col-xs-3 w modal fade aside aside-md manages-aside\" id=\"subnav\"></div> <div ui-view=\"list\" class=\"col-xs-3 w-xl modal fade aside aside-sm b-r\" id=\"list\"></div> <div ui-view=\"detail\" class=\"col-xs-6 bg\" id=\"detail\"></div> </div> </div> </div> "
  );


  $templateCache.put('views/manage/side_subnav.html',
    " <div class=\"row-col bg b-r\"> <div class=\"b-b\"> <div class=\"navbar\"> <ul class=\"nav navbar-nav\"> <li class=\"nav-item\"> <span class=\"navbar-item text-md\">Settings</span> </li> </ul> </div> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\" title=\"System Settings\"> System </div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li show-if-has-any-permit=\"jurisdiction:view\" ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.jurisdictions\" class=\"nav-link text-muted block\"> Jurisdictions </a> </li> <li show-if-has-any-permit=\"zone:view\" ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.zones\" class=\"nav-link text-muted block\"> Zones </a> </li> <li show-if-has-any-permit=\"servicegroup:view\" ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.servicegroups\" class=\"nav-link text-muted block\"> Groups </a> </li> <li show-if-has-any-permit=\"servicetype:view\" ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.servicetypes\" class=\"nav-link text-muted block\"> Types </a> </li> <li show-if-has-any-permit=\"service:view\" ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.services\" class=\"nav-link text-muted block\"> Services </a> </li> <li show-if-has-any-permit=\"priority:view\" ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.priorities\" class=\"nav-link text-muted block\"> Priorities </a> </li> <li show-if-has-any-permit=\"status:view\" ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.statuses\" class=\"nav-link text-muted block\"> Statuses </a> </li> <li show-if-has-any-permit=\"item:view\" ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.items\" class=\"nav-link text-muted block\"> Items </a> </li> </ul> </div> </div> <div class=\"p-a-md\" show-if-has-any-permit=\"user:view, role:view\"> <div class=\"m-b text-muted text-xs\" title=\"General Settings\"> General </div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li show-if-has-any-permit=\"user:view\" ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.parties\" class=\"nav-link text-muted block\"> Parties </a> </li> <li show-if-has-any-permit=\"role:view\" ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.roles\" class=\"nav-link text-muted block\"> Roles </a> </li> </ul> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/parties/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Jurisdiction Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Jurisdiction\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit && party._id\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted no-border\" title=\"Click to edit party\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit && canSave\" class=\"nav-item b-l p-l\"> <a ng-click=\"save()\" class=\"nav-link text-muted no-border\" title=\"Click to save party\"> Save </a> </li> <li ng-show=\"edit && !(party.deletedAt || party.lockedAt) && party._id\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"block()\" class=\"nav-link text-muted no-border\" title=\"Click to block party\"> Block </a> </li> <li ng-show=\"edit && (party.deletedAt || party.lockedAt) && party._id\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"unblock()\" class=\"nav-link text-muted no-border\" title=\"Click to unblock party\"> Unblock </a> </li> </ul> "
  );


  $templateCache.put('views/parties/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/parties/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"partyForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Area\"> <div ng-show=\"!edit\" class=\"form-group\"> <label title=\"Area\" class=\"floating-label\">Area</label> <input ng-disabled=\"!edit\" ng-model=\"party.jurisdiction.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"jurisdiction\" class=\"form-control\"> </div> <div ng-show=\"edit\" class=\"form-group form-material floating\"> <oi-select oi-options=\"item.name for item in searchJurisdictions($query) track by item.id\" ng-model=\"party.jurisdiction\" placeholder=\"Select Area\" class=\"form-control\" oi-select-options=\"{cleanModel: true}\"></oi-select> <label title=\"Area\" class=\"floating-label\">Area</label> </div> </div> <div class=\"m-b m-t-lg\" title=\"Zone\"> <div ng-show=\"!edit\" class=\"form-group\"> <label title=\"Zone\" class=\"floating-label\">Zone</label> <input ng-disabled=\"!edit\" ng-model=\"party.zone.name.en\" ng-required ng-minlength=\"2\" type=\"text\" name=\"zone\" class=\"form-control\"> </div> <div ng-show=\"edit\" class=\"form-group form-material floating\"> <oi-select oi-options=\"item.name.en for item in searchZones($query) track by item._id\" ng-model=\"party.zone\" placeholder=\"Select Zone\" class=\"form-control\" oi-select-options=\"{cleanModel: true}\"></oi-select> <label title=\"Zone\" class=\"floating-label\">Zone</label> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6\" title=\"Party Name\"> <div class=\"form-group\"> <label title=\"Party Name\" class=\"floating-label\">Name</label> <input ng-disabled=\"!edit\" ng-model=\"party.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> </div> <div class=\"col-sm-6\" title=\"Party Phone\"> <div class=\"form-group\"> <label title=\"Mobile Phone Number\" class=\"floating-label\">Phone</label> <input ng-disabled=\"!edit\" ng-model=\"party.phone\" ng-required ng-minlength=\"2\" type=\"text\" name=\"phone\" class=\"form-control\"> </div> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6\" title=\"Party Email\"> <div class=\"form-group\"> <label title=\"Email Address\" class=\"floating-label\">Email</label> <input ng-disabled=\"!edit\" ng-model=\"party.email\" ng-required ng-minlength=\"2\" type=\"text\" name=\"email\" class=\"form-control\"> </div> </div> <div class=\"col-sm-6\" title=\"SIP Number\"> <div class=\"form-group\"> <label title=\"SIP Phone Number\" class=\"floating-label\">SIP Number</label> <input ng-disabled=\"!edit\" ng-model=\"party.sipNumber\" ng-required ng-minlength=\"2\" type=\"text\" name=\"sipNumber\" class=\"form-control\"> </div> </div> </div> <div ng-show=\"edit\" class=\"row m-t-lg\"> <div class=\"col-sm-6\" title=\"Party Password\"> <div class=\"form-group\"> <label title=\"Password\" class=\"floating-label\">Password</label> <input ng-change=\"onPasswordChange()\" ng-disabled=\"!edit\" ng-model=\"party.password\" ng-required ng-minlength=\"2\" type=\"password\" name=\"password\" class=\"form-control\"> <span ng-show=\"party.password && party.password.length < 8\" class=\"help-block text-red-700 font-weight-400\">Password length must be atleast 8 characters</span> </div> </div> <div ng-show=\"party.password && party.password.length >= 8\" class=\"col-sm-6\" title=\"Password Confirmation\"> <div class=\"form-group\"> <label title=\"Password Confirmation\" class=\"floating-label\">Password Confirm</label> <input ng-change=\"onConfirmPassword()\" ng-disabled=\"!edit\" ng-model=\"party.confirm\" ng-required ng-minlength=\"2\" type=\"password\" name=\"confirm\" class=\"form-control\"> <span ng-show=\"passwordDontMatch\" class=\"help-block text-red-700 font-weight-400\">Password does not match</span> </div> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-12\"> <div ng-show=\"!edit\" class=\"form-group\"> <label title=\"Workspace\" class=\"floating-label\">Workspace</label> <input ng-disabled=\"!edit\" ng-model=\"party.relation.workspace\" ng-required ng-minlength=\"2\" type=\"text\" name=\"workspace\" class=\"form-control\"> </div> <div ng-show=\"edit\" class=\"form-inputs\"> <div class=\"form-group\"> <label class=\"floating-label\">Workspace</label> <div class=\"radio-custom radio-primary\" ng-repeat=\"workspace in workspaces\"> <input type=\"radio\" ng-model=\"party.relation.workspace\" ng-value=\"workspace\"> <label>{{ workspace }}</label> </div> </div> </div> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-12\"> <div ng-show=\"!edit\" class=\"form-group\"> <label title=\"Roles\" class=\"floating-label\">Roles</label> <input ng-disabled=\"!edit\" ng-model=\"party._roles\" ng-required ng-minlength=\"2\" type=\"text\" name=\"_roles\" class=\"form-control\"> </div> <div ng-show=\"edit\" class=\"form-inputs\"> <div class=\"form-group\"> <label class=\"floating-label\">Roles</label> <div class=\"checkbox-custom checkbox-primary\" ng-repeat=\"role in roles\"> <input type=\"checkbox\" checklist-model=\"party._assigned\" checklist-value=\"role._id\"> <label>{{ role.name }}</label> </div> </div> </div> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/parties/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Parties ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(party)\" class=\"list-item list-item-padded\" ng-repeat=\"party in parties\" title=\"{{party.about}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Avatar\" data=\"{{party.name}}\" height=\"60\" width=\"60\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Working Area\" class=\"pull-right text-xs text-muted\"> {{party.jurisdiction.name}} </span> <div class=\"item-title\" title=\"Full Name\"> <span class=\"_500\">{{party.name}}</span> </div> <p title=\"Work Description\" class=\"block text-muted text-ellipsis\"> {{party.relation.type}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"></div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/priorities/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Priority Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Priority\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit && priority._id\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted no-border\" title=\"Click to edit priority\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"save()\" class=\"nav-link text-muted no-border\" title=\"Click to save priority\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/priorities/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/priorities/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"priorityForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Priority Name\"> <div class=\"row\"> <div class=\"form-group col-sm-6\"> <label title=\"Priority Name\" class=\"floating-label\">Name</label> <input ng-disabled=\"!edit\" ng-model=\"priority.name.en\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> <div class=\"form-group col-sm-6\"> <label title=\"Priority Name in Swahili\" class=\"floating-label\">Jina</label> <input ng-disabled=\"!edit\" ng-model=\"priority.name.sw\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> </div> </div> <div class=\"m-t-lg\" title=\"Priority Weight\"> <div class=\"form-group\"> <label title=\"Priority Weight\" class=\"floating-label\">Weight</label> <input ng-disabled=\"!edit\" ng-model=\"priority.weight\" ng-required type=\"number\" name=\"name\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Priority Color\"> <div class=\"m-t-lg\"> <div class=\"form-group\"> <label title=\"Priority Color\" class=\"floating-label\">Priority Color(HEX)</label> <color-picker ng-model=\"priority.color\" options=\"colorPickerOptions\"> </color-picker> </div> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/priorities/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Priorities ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(priority)\" class=\"list-item list-item-padded\" ng-repeat=\"priority in priorities\" title=\"{{ priority.about }}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Priority Visual Color\" data=\"{{ priority.name.en }}\" height=\"60\" width=\"60\" color=\"{{ priority.color }}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Priority Weight\" class=\"pull-right text-xs text-muted\"> {{ priority.weight }} </span> <div class=\"item-title\" title=\"Priority Name\"> <span class=\"_500\">{{ priority.name.en }}</span> </div> <p title=\"Priority Description\" class=\"block text-muted text-ellipsis\"> {{ priority.name.en }} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"></div> <span class=\"text-sm text-muted\">Total: {{ total }}</span> </div> </div> "
  );


  $templateCache.put('views/roles/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Role Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Role\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit && role._id\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted no-border\" title=\"Click to edit role\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"save()\" class=\"nav-link text-muted no-border\" title=\"Click to save role\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/roles/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/roles/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"roleForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Role Name\"> <div class=\"form-group\"> <label title=\"Role Name\" class=\"floating-label\">Name</label> <input ng-disabled=\"!edit\" ng-model=\"role.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Role Description\"> <div class=\"form-group\"> <label class=\"floating-label\">Description</label> <textarea ng-disabled=\"!edit\" ng-model=\"role.description\" msd-elastic name=\"description\" class=\"form-control\" rows=\"2\">\n" +
    "                    </textarea> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-12\"> <div class=\"form-inputs form-inputs-material\"> <div class=\"form-group\" ng-class=\"{'form-group-disabled':!edit}\"> <label class=\"floating-label\">Permissions</label> <div class=\"row\"> <div class=\"col-md-4\" ng-repeat=\"permission in grouped\"> <h6>{{permission.resource}}</h6> <div class=\"checkbox-custom checkbox-primary\" ng-repeat=\"permit in permission.permits | orderBy : resource\"> <input ng-show=\"edit\" type=\"checkbox\" checklist-model=\"role._assigned\" checklist-value=\"permit._id\"> <label title=\"{{permit.description}}\">{{permit.resource}} {{permit.action}}</label> </div> <br> </div> </div> </div> </div> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/roles/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Roles ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(role)\" class=\"list-item list-item-padded\" ng-repeat=\"role in roles\" title=\"{{role.description}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Role Visual Color\" data=\"{{role.name}}\" height=\"60\" width=\"60\" color=\"{{role.color}}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <div class=\"item-title\" title=\"Role Name\"> <span class=\"_500\">{{role.name}}</span> </div> <p title=\"Role Description\" class=\"block text-muted text-ellipsis\"> {{role.description}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"></div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/servicegroups/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Service Group Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Service Group\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted no-border\" title=\"Click to edit service group\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"save()\" class=\"nav-link text-muted no-border\" title=\"Click to save service group\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/servicegroups/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/servicegroups/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"servicegroupForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Service Group Name\"> <div class=\"form-group\"> <label title=\"Service Group Code\" class=\"floating-label\">Code</label> <input ng-disabled=\"!edit\" ng-model=\"servicegroup.code\" ng-required ng-minlength=\"1\" type=\"text\" name=\"code\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Service Group Name\"> <div class=\"row\"> <div class=\"form-group col-xs-12 col-sm-6\"> <label title=\"Service Group Name\" class=\"floating-label\">Name</label> <input ng-disabled=\"!edit\" ng-model=\"servicegroup.name.en\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> <div class=\"form-group col-xs-12 col-sm-6\"> <label title=\"Service Group Name in Swahili\" class=\"floating-label\">Jina</label> <input ng-disabled=\"!edit\" ng-model=\"servicegroup.name.sw\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> </div> </div> <div class=\"m-t-lg\" title=\"Service Group Weight\"> <div class=\"row\"> <div class=\"form-group col-xs-12 col-sm-6\"> <label class=\"floating-label\">Description</label> <textarea ng-disabled=\"!edit\" ng-model=\"servicegroup.description.en\" msd-elastic name=\"about\" class=\"form-control\" rows=\"3\">\n" +
    "                      </textarea> </div> <div class=\"form-group col-xs-12 col-sm-6\"> <label class=\"floating-label\">Maelezo</label> <textarea ng-disabled=\"!edit\" ng-model=\"servicegroup.description.sw\" msd-elastic name=\"about\" class=\"form-control\" rows=\"3\">\n" +
    "                      </textarea> </div> </div> </div> <div class=\"m-t-lg\" title=\"Service Group Color\"> <div class=\"m-t-lg\"> <div class=\"form-group\"> <label title=\"Service Group Color\" class=\"floating-label\">Service Group Color(HEX)</label> <color-picker ng-model=\"servicegroup.color\" options=\"colorPickerOptions\"> </color-picker> </div> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicegroups/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Service Groups ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(servicegroup)\" class=\"list-item list-item-padded\" ng-repeat=\"servicegroup in servicegroups\" title=\"{{ servicegroup.description.en }}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Service Group Code\" data=\"{{ servicegroup.code }}\" height=\"60\" width=\"60\" color=\"{{ servicegroup.color }}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Service Group Code\" class=\"pull-right text-xs text-muted\"> {{ servicegroup.code }} </span> <div title=\"Service Group Name\" class=\"item-title\"> <span class=\"_500\">{{ servicegroup.name.en }}</span> </div> <p class=\"block text-muted text-ellipsis\"> {{ servicegroup.description.en }} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"></div> <span class=\"text-sm text-muted\">Total: {{ total }}</span> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"!servicerequest.operator\" class=\"nav-item b-r p-r\"> <a show-if-has-permit=\"servicerequest:attend\" class=\"nav-link text-muted no-border\" title=\"Click To Attend Issue\" ng-click=\"onAttend()\"> <span class=\"nav-text\"> <i class=\"ion-ios-shuffle-strong\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator\" class=\"nav-item\"> <a ng-if=\"mailTo\" href=\"{{ mailTo }}\" class=\"nav-link text-muted\" title=\"Click to Send Issue to Area\"> <span class=\"nav-text\"> <i class=\"icon-action-redo\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator && servicerequest.assignee && !servicerequest.attendedAt && !servicerequest.resolvedAt\" class=\"nav-item b-l p-l\"> <a show-if-has-permit=\"servicerequest:attend\" ng-click=\"onAttended()\" class=\"nav-link text-muted no-border\" title=\"Click To Mark Issue as Attended\"> <span class=\"nav-text\"> <i class=\"icon-crop\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator && servicerequest.assignee &&\n" +
    "    servicerequest.attendedAt && !servicerequest.completedAt && !servicerequest.resolvedAt\" class=\"nav-item b-l p-l\"> <a show-if-has-permit=\"servicerequest:complete\" ng-click=\"onComplete()\" class=\"nav-link text-muted no-border\" title=\"Click To Mark Issue as Complete\"> <span class=\"nav-text\"> <i class=\"ti-check-box\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator && servicerequest.assignee && servicerequest.attendedAt && servicerequest.completedAt && !servicerequest.verifiedAt && !servicerequest.resolvedAt\" class=\"nav-item b-l p-l\"> <a show-if-has-permit=\"servicerequest:verify\" ng-click=\"onVerify()\" class=\"nav-link text-muted no-border\" title=\"Click To Mark Issue as Verified\"> <span class=\"nav-text\"> <i class=\"ti-eye\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator && servicerequest.assignee && servicerequest.attendedAt && servicerequest.completedAt && servicerequest.verifiedAt && !servicerequest.approvedAt && !servicerequest.resolvedAt\" class=\"nav-item b-l p-l\"> <a show-if-has-permit=\"servicerequest:approve\" ng-click=\"onApprove()\" class=\"nav-link text-muted no-border\" title=\"Click To Mark Issue as Approve\"> <span class=\"nav-text\"> <i class=\"ti-new-window\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator && servicerequest.assignee && servicerequest.attendedAt && !servicerequest.resolvedAt\" class=\"nav-item b-l p-l\"> <a show-if-has-permit=\"servicerequest:complete\" ng-click=\"showWorklogModal()\" class=\"nav-link text-muted no-border\" title=\"Click to Record Material & Equipment Used\"> <span class=\"nav-text\"> <i class=\"icon-basket-loaded\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator && !servicerequest.resolvedAt\" class=\"nav-item b-l p-l\"> <a ngf-select=\"onImage($file)\" class=\"nav-link text-muted no-border\" title=\"Click To Attach Supporting Images\"> <span class=\"nav-text\"> <i class=\"icon-camera\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator && !servicerequest.resolvedAt\" class=\"nav-item b-l p-l\"> <a ngf-select=\"onDocument($file)\" class=\"nav-link text-muted no-border\" title=\"Click To Attach Supporting Documents\"> <span class=\"nav-text\"> <i class=\"icon-paper-clip\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator && !servicerequest.resolvedAt\" class=\"nav-item b-l p-l\"> <a show-if-has-permit=\"servicerequest:resolve\" ng-click=\"onResolve()\" class=\"nav-link text-muted no-border\" title=\"Click To Resolve and Signal Feedback Provided To Reporter\"> <span class=\"nav-text\"> <i class=\"icon-call-out\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator && servicerequest.resolvedAt\" class=\"nav-item b-l p-l\"> <a ng-click=\"onReOpen()\" class=\"nav-link text-muted no-border\" title=\"Click To Re-Open The Issue\"> <span class=\"nav-text\"> <i class=\"icon-call-in\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator\" class=\"nav-item b-l p-l\"> <a ng-click=\"onCopy()\" class=\"nav-link text-muted no-border\" title=\"Click To Copy Reporter Information & Create New Issue\"> <span class=\"nav-text\"> <i class=\"ti-cut\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator\" class=\"nav-item b-l p-l p-r\"> <a print-btn class=\"nav-link text-muted no-border\" title=\"Click To Print Issue\"> <span class=\"nav-text\"> <i class=\"icon-printer\"></i> </span> </a> </li> <li ng-if=\"servicerequest.operator\" class=\"nav-item b-l p-l p-r b-r\" title=\"Click To Refresh Issue\"> <a ng-click=\"onRefresh()\" class=\"nav-link text-muted no-border\"> <span class=\"nav-text\"> <i class=\"icon-reload\"></i> </span> </a> </li> </ul> "
  );


  $templateCache.put('views/servicerequests/_partials/assignee_modal.html',
    "<div> <div class=\"modal-header\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$dismiss()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\"> Assign Service Request To: </h4> </div> <div class=\"modal-body\"> <div class=\"container-fluid\"> <div class=\"row-col lt\"> <div class=\"list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearchAssignees()\" ng-model=\"search.party\" class=\"form-control form-control-sm\" placeholder=\"Search Assignee ...\"> <span class=\"input-group-btn\"> <button ng-click=\"onSearchAssignees()\" class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body hover\"> <div class=\"list\" data-ui-list=\"info\"> <div class=\"list-item\" ng-repeat=\"assignee in assignees\" title=\"{{assignee.name}}\" ng-click=\"assign(assignee)\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"{{assignee.name}}\" data=\"{{assignee.name}}\" height=\"60\" width=\"60\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <div class=\"item-title\"> {{assignee.name}} <br> <span class=\"text-sm text-muted\"> {{assignee.relation.type}} </span> </div> </div> </div> </div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/comments.html',
    " <div class=\"padding b-t\"> <h6 class=\"m-b\" title=\"Internal Notes & Comments\">Internal Notes</h6> <div class=\"p-a\"> <div print-hide ng-if=\"!servicerequest.resolvedAt\" class=\"p-a p-y-sm b-t b-b m-b\"> <form> <div class=\"input-group b-a b-transparent\"> <input ng-enter=\"comment()\" ng-model=\"note.content\" type=\"text\" class=\"form-control no-border font-size-12\" placeholder=\"Write your note\" id=\"internal-comment-box\"> <span class=\"input-group-btn\"> <button ng-click=\"comment()\" class=\"btn no-bg no-shadow\" type=\"button\"> <i class=\"fa fa-send text-success\"></i> </button> </span> </div> </form> </div> <div class=\"streamline m-b\"> <div class=\"sl-item\" ng-style=\"comment.color ? {'border-color': comment.color} : {}\" ng-repeat=\"comment in comments\"> <div class=\"sl-content\"> <div class=\"sl-date text-muted\"> <span class=\"text-info\"> {{comment.changer.name}} </span> on {{comment.createdAt | date:'dd MMM yyyy hh:mm:ss a'}} </div> <p ng-if=\"comment.comment\">{{comment.comment}}</p> <p ng-if=\"comment.item\"> Used {{comment.quantity}} - {{comment.item.properties.unit}} of {{comment.item.name.en}} </p> <p ng-if=\"comment.location && comment.location.coordinates\"> Change location to longitude: {{comment.location.coordinates[0]}}, latitude: {{comment.location.coordinates[1]}} </p> <p ng-if=\"comment.status && comment.status.name\"> Change status to <span class=\"label rounded success pos-rlt m-l-xs b-a-xs\" ng-style=\"comment.status ? {'background-color': comment.status.color} : {}\"> <b class=\"arrow left b-success pull-in\" ng-style=\"comment.status ? {'border-color': comment.status.color} : {}\"></b> {{comment.status.name}} </span> </p> <p ng-if=\"comment.priority && comment.priority.name\"> Change priority to <span class=\"label rounded success pos-rlt m-l-xs b-a-xs\" ng-style=\"comment.priority ? {'background-color': comment.priority.color} : {}\"> <b class=\"arrow left b-success pull-in\" ng-style=\"comment.priority ? {'border-color': comment.priority.color} : {}\"></b> {{comment.priority.name}} </span> </p> <p ng-if=\"comment.assignee && comment.assignee.name\"> Assignee to {{comment.assignee.name}} </p> <p ng-if=\"comment.resolvedAt\"> Change status to <span class=\"label rounded success pos-rlt m-l-xs b-a-xs\" style=\"background-color: #4CAF50\"> <b class=\"arrow left b-success pull-in\" style=\"border-color: #4CAF50\"></b> Resolved </span> </p> <p ng-if=\"comment.reopenedAt\"> Change status to <span class=\"label rounded success pos-rlt m-l-xs b-a-xs\" style=\"background-color: #F44336\"> <b class=\"arrow left b-success pull-in\" style=\"border-color: #F44336\"></b> Reopened </span> </p> <p ng-if=\"comment.approvedAt\"> Change status to <span class=\"label rounded success pos-rlt m-l-xs b-a-xs\" style=\"background-color: #1B5E1F\"> <b class=\"arrow left b-success pull-in\" style=\"border-color: #1B5E1F\"></b> Approved </span> </p> <p ng-if=\"comment.verifiedAt\"> Change status to <span class=\"label rounded success pos-rlt m-l-xs b-a-xs\" style=\"background-color: #EF6C01\"> <b class=\"arrow left b-success pull-in\" style=\"border-color: #EF6C01\"></b> Verified </span> </p> <p ng-if=\"comment.completedAt\"> Change status to <span class=\"label rounded success pos-rlt m-l-xs b-a-xs\" style=\"background-color: #0D47A3\"> <b class=\"arrow left b-success pull-in\" style=\"border-color: #0D47A3\"></b> Completed </span> </p> <p ng-if=\"comment.attendedAt\"> Change status to <span class=\"label rounded success pos-rlt m-l-xs b-a-xs\" style=\"background-color: #F9A825\"> <b class=\"arrow left b-success pull-in\" style=\"border-color: #F9A825\"></b> Attended </span> </p> <p ng-if=\"comment.image && comment.image.stream\"> <a href=\"{{comment.image.stream}}\" target=\"_blank\" title=\"{{comment.image.filename}}\"> <img data-ng-src=\"{{comment.image.stream}}\" height=\"50px;\"> </a> </p> <p ng-if=\"comment.document && comment.document.download\"> Attached <a href=\"{{comment.document.download}}\" target=\"_blank\" title=\"{{comment.document.filename}}\"> <span class=\"text-muted\"> {{comment.document.filename}} </span> </a> </p> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/create.html',
    " <div class=\"row-col\"> <div class=\"b-b bg\"> <div class=\"box-header\" style=\"padding:1.2rem\"> <h2> Report New Issue </h2> </div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"servicerequestForm\" role=\"form\" autocomplete=\"off\"> <div class=\"box\"> <div class=\"box-header\"> <h6 title=\"Reporter or Customer Details\"> Reporter Details </h6> </div> <div class=\"box-body\"> <div class=\"row m-b\"> <div class=\"col-sm-6\"> <div class=\"form-group\"> <label title=\"Reporter or Customer Phone Number\"> Phone </label> <input ng-model=\"servicerequest.reporter.phone\" ng-required ng-minlength=\"2\" focus-if=\"!servicerequest.reporter.phone\" type=\"text\" name=\"phone\" class=\"form-control\" title=\"Reporter or Customer Phone Number\"> </div> </div> <div class=\"col-sm-6\"> <div class=\"form-group\"> <label title=\"Reporter or Customer Name\"> Name </label> <input ng-model=\"servicerequest.reporter.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\" title=\"Reporter or Customer Name\"> </div> </div> </div> <div class=\"row m-b\"> <div class=\"col-sm-6\"> <label title=\"Reporter or Customer Account Number\"> Account </label> <div class=\"form-group\"> <div class=\"input-group\"> <input ng-model=\"servicerequest.reporter.account\" type=\"text\" name=\"account\" class=\"form-control\" title=\"Reporter or Customer Account Number\"> <span class=\"input-group-btn\"> <button ng-disabled=\"!servicerequest.reporter.account\" ng-click=\"openLookupModal()\" class=\"btn btn-secondary\" type=\"button\" title=\"Click to Lookup for Customer Account Details\"> <i class=\"icon-magnifier\"></i> </button> </span> </div> </div> </div> <div class=\"col-sm-6\"> <div class=\"form-group\"> <label title=\"Reporter or Customer Email Address\"> Email </label> <input ng-model=\"servicerequest.reporter.email\" type=\"email\" name=\"email\" class=\"form-control\" title=\"Reporter or Customer Email Address\"> </div> </div> </div> <div class=\"p-t p-b\" style=\"margin-top: 2rem\"> <h6 title=\"Communication Method Used by Reporter To Report\"> Communication Method </h6> </div> <div class=\"row m-b\"> <div class=\"col-sm-2 m-b\" ng-repeat=\"method in methods\"> <div> <label class=\"md-check\" title=\"Method of Communication used by Reporter\"> <input type=\"radio\" ng-model=\"servicerequest.method.name\" ng-value=\"method\" name=\"method\"> <i class=\"blue\"></i> {{ method }} </label> </div> </div> </div> <div class=\"p-t p-b m-t\" style=\"margin-top: 4rem\"> <h6 title=\"Issue Details\"> Issue Details </h6> </div> <div class=\"row m-b\"> <div class=\"col-sm-6\"> <div class=\"form-group form-material floating\" title=\"Select Service\"> <oi-select oi-options=\"item.name.en for item in searchServices($query) track by item.id\" ng-model=\"servicerequest.service\" ng-required placeholder=\"Select Service\" class=\"form-control\"></oi-select> </div> </div> <div class=\"col-sm-6\"> <div class=\"form-group form-material floating\" title=\"Select Area\"> <oi-select oi-options=\"item.name for item in searchJurisdictions($query) track by item.id\" ng-model=\"servicerequest.jurisdiction\" ng-required placeholder=\"Select Area\" class=\"form-control\"></oi-select> </div> </div> </div> <div class=\"row m-b\"> <div class=\"col-sm-12\"> <div class=\"form-group\"> <label title=\"Reporter or Customer Address\"> Address </label> <textarea ng-model=\"servicerequest.address\" ng-required msd-elastic name=\"address\" class=\"form-control\" rows=\"2\" title=\"Reporter or Customer Address\">\n" +
    "                      </textarea> </div> </div> </div> <div class=\"row m-b\"> <div class=\"col-sm-12\"> <div class=\"form-group\"> <label title=\"Issue Details or Description\"> Description </label> <textarea ng-model=\"servicerequest.description\" ng-required msd-elastic name=\"description\" class=\"form-control\" rows=\"2\" title=\"Issue Details or Description\">\n" +
    "                      </textarea> </div> </div> </div> </div> <div class=\"p-a text-right\"> <button ui-sref=\"app.servicerequests.list\" type=\"button\" ng-click=\"cancel()\" class=\"btn\" title=\"Click to Cancel\"> Cancel </button> <button ng-disabled=\"servicerequestForm.$invalid || !servicerequest.reporter.phone || !servicerequest.reporter.name || !servicerequest.service || !servicerequest.jurisdiction || !servicerequest.address || !servicerequest.description\" type=\"submit\" class=\"btn info\" title=\"Click to Submit\"> Submit </button> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/servicerequests/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\" print-section> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <h4 class=\"_600\"> <span title=\"Issue Nature\"> {{servicerequest.service.name}} </span> - <span title=\"Issue Number\"> #{{servicerequest.code}} </span> <span class=\"pull-right font-size-14\"> <span title=\"Issue Group/Category\"> <span class=\"text-muted font-size-10\">Group</span> {{servicerequest.group.name}} </span> <br> <span title=\"Area Responsible\"> <span class=\"text-muted font-size-10\">Area</span> {{servicerequest.jurisdiction.name}} </span> <br> <span ng-if=\"servicerequest.jurisdiction.phone && servicerequest.jurisdiction.phone != 'N/A'\" title=\"Area Phone Number\"> <span class=\"text-muted font-size-10\">Phone</span> {{servicerequest.jurisdiction.phone}} </span> </span> </h4> <div class=\"p-y\"> <div title=\"Reporter Name\"> <span class=\"text-muted font-size-12\">From: </span> <span ng-click=\"filterByReporter(servicerequest.reporter.name)\">{{servicerequest.reporter.name}}</span> </div> <div title=\"Reporter Account Number\"> <span class=\"text-muted font-size-12\">Account #: </span> <span ng-click=\"filterByReporter(servicerequest.reporter.account)\">{{servicerequest.reporter.account}}</span> </div> <div title=\"Reporter Phone Number\"> <span class=\"text-muted font-size-12\">Phone #: </span> <span ng-click=\"filterByReporter(servicerequest.reporter.phone)\">{{servicerequest.reporter.phone}}</span> </div> <div title=\"Reporter Address\"> <span class=\"text-muted font-size-12\">Address: </span> <span>{{servicerequest.address}}</span> </div> <div title=\"Communication Method\"> <span class=\"text-muted font-size-12\">Method: </span> <span>{{servicerequest.method.name}}</span> </div> </div> <div print-hide class=\"p-y b-t\" ng-show=\"servicerequest.call.startedAt && servicerequest.call.endedAt\"> <span title=\"Call Start Time\"> <span class=\"text-muted font-size-12\"> Call Start: </span> <span class=\"font-size-12\">{{servicerequest.call.startedAt | date:'dd MMM yyyy hh:mm:ss a'}}</span> </span> <span title=\"Call End Time\" class=\"p-l\"> <span class=\"text-muted font-size-12\">Call End: </span> <span class=\"font-size-12\">{{servicerequest.call.endedAt | date:'dd MMM yyyy hh:mm:ss a'}}</span> </span> <span title=\"Call Duration\" class=\"p-l\"> <span class=\"text-muted font-size-12\">Call Duration: </span> <span class=\"font-size-12\">{{servicerequest.call.duration.human}}</span> </span> </div> <div print-hide class=\"p-b\" ng-class=\"{'p-y b-t':!servicerequest.call}\"> <span title=\"Date Issue Reported\"> <span class=\"text-muted font-size-12\">Reported: </span> <span class=\"font-size-12\">{{servicerequest.createdAt | date:'dd MMM yyyy hh:mm:ss a'}}</span> </span> <span ng-if=\"servicerequest.resolvedAt\" title=\"Date Issue Resolved\" class=\"p-l\"> <span class=\"text-muted font-size-12\">Resolved: </span> <span class=\"font-size-12\">{{servicerequest.resolvedAt | date:'dd MMM yyyy hh:mm:ss a'}}</span> </span> <span ng-if=\"servicerequest.resolvedAt\" title=\"Time Taken To Resolve\" class=\"p-l\"> <span class=\"text-muted font-size-12\">TTR: </span> <span class=\"font-size-12\"> {{servicerequest.ttr.human}} </span> </span> </div> <div class=\"p-y b-t\"> <span title=\"Operator Responsible\"> <span class=\"text-muted font-size-12\">Operator: </span> <span>{{servicerequest.operator.name}}</span> </span> <a title=\"Click to assign\" auto-close=\"outsideClick\" class=\"m-l\" ng-click=\"showAssigneeModal()\"> <span class=\"text-muted font-size-12\">Assignee: </span> <span>{{servicerequest.assignee.name || 'N/A'}}</span> </a> <span ng-if=\"!servicerequest.resolvedAt\" uib-dropdown class=\"label primary m-l\" title=\"Status\" style=\"background-color:{{servicerequest.status.color}}\"> <span uib-dropdown-toggle class=\"font-size-12 text-white\">Status: {{servicerequest.status.name}} </span> <div ng-if=\"servicerequest.operator\" uib-dropdown-menu class=\"dropdown-menu w dropdown-menu-scale\"> <a ng-repeat=\"status in statuses\" ng-click=\"changeStatus(status)\" class=\"dropdown-item\" href=\"#\" title=\"Status - {{status.name}}\"> <span>{{status.name}}</span> </a> </div> </span> <span ng-if=\"!servicerequest.resolvedAt\" uib-dropdown class=\"label danger m-l\" title=\"Priority\" style=\"background-color:{{servicerequest.priority.color}}\"> <span uib-dropdown-toggle class=\"font-size-12 text-white\">Priority: {{servicerequest.priority.name}}</span> <div ng-if=\"servicerequest.operator\" uib-dropdown-menu class=\"dropdown-menu w dropdown-menu-scale\"> <a ng-repeat=\"priority in priorities\" ng-click=\"changePriority(priority)\" class=\"dropdown-item\" href=\"#\" title=\"Priority {{priority.name}}\"> <span>{{priority.name}}</span> </a> </div> </span> <span ng-if=\"servicerequest.resolvedAt\" class=\"label danger m-l\" style=\"background-color: #4CAF50\"> <span class=\"font-size-12 text-white\">Resolved</span> </span> </div> </div> <div class=\"padding b-t\"> <h6 class=\"m-b\" title=\"Issue Description\">Description</h6> <p class=\"text-lt\"> {{servicerequest.description}} </p> <p>&nbsp;</p> </div> <div ng-show=\"worklogs && worklogs.length > 0\" ng-include=\"'views/servicerequests/_partials/worklog.html'\"></div> <div class=\"padding b-t\" ng-show=\"servicerequest.location && servicerequest.location.coordinates\"> <h6 class=\"m-b\" title=\"Issue Map\">Map</h6> <leaflet id=\"servicerequest-map\" center=\"map.center\" markers=\"map.markers\" bounds=\"map.bounds\" defaults=\"map.defaults\" height=\"280px\" width=\"100%\"></leaflet> <p>&nbsp;</p> </div> <div print-hide class=\"padding b-t\" ng-show=\"images && images.length > 0\"> <h6 class=\"m-b\" title=\"Issue Images\">Images</h6> <ng-gallery images=\"images\"></ng-gallery> </div> <div print-hide class=\"padding b-t\" ng-show=\"documents && documents.length > 0\"> <h6 class=\"m-b\" title=\"Issue Images\">Documents</h6> <div> <a ng-repeat=\"document in documents\" href=\"{{document.download}}\" class=\"block m-b-xs\" target=\"_blank\" title=\"{{document.filename}}\"> <span class=\"label\">{{document.type}}</span> {{document.filename}} <small class=\"m-l text-muted\"> {{document.length | prettyBytes}} </small> </a> </div> </div> <div print-hide ng-if=\"servicerequest.operator\" ng-include=\"'views/servicerequests/_partials/comments.html'\"></div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-enter=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Issues ...\"> <span class=\"input-group-btn\"> <button ng-click=\"onSearch()\" class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\" id=\"scrollable-servicerequest-list\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(_servicerequest)\" class=\"list-item list-item-padded\" ng-class=\"{'active': _servicerequest._id === servicerequest._id}\" ng-repeat=\"_servicerequest in servicerequests\" title=\"{{_servicerequest.description}}\" style=\"border-left: 2px solid {{_servicerequest.priority.color || '#f3c111'}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Status & Area\" data=\"{{_servicerequest.jurisdiction.name}}\" height=\"60\" width=\"60\" shape=\"round\" color=\"{{_servicerequest.status.color}}\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Issue Report Date\" class=\"pull-right text-xs text-muted\"> {{_servicerequest.createdAt | date:'dd MMM yyyy HH:mm'}} </span> <div class=\"item-title\"> <a href=\"#\" class=\"_500\">{{_servicerequest.service.name}} <br><span title=\"Issue Number\" class=\"font-size-12\"> #{{_servicerequest.code}}</span></a> </div> <small class=\"block text-xs text-muted text-ellipsis\"> <span title=\"Reporter Name\"> <i class=\"icon-user\"></i>&nbsp;&nbsp;{{(_servicerequest.reporter.name) || 'NA'}} </span> <span class=\"pull-right\" title=\"Reporter Phone Number\"> <i class=\"icon-phone\"></i>&nbsp;&nbsp;{{(_servicerequest.reporter.phone) ||'NA'}} </span> </small> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"$parent.total\" ng-model=\"$parent.page\" items-per-page=\"$parent.limit\" ng-change=\"find(query)\" template-url=\"views/_partials/list_pager.html\" style=\"padding-left: 12px\" role=\"group\"></div> <div class=\"btn-group pull-right\"> <a title=\"Click To Refresh Issues\" ng-click=\"load({}, false)\" class=\"btn btn-default btn-xs\"> <i class=\"icon-reload\"></i> </a> <a title=\"Click To Export Issues\" class=\"btn btn-default btn-xs\" ng-csv=\"export\" csv-header=\"['Issue Number','Reported Date','Call Start Time', 'Call End Time','Call Duration(Minutes)', 'Call Duration(Seconds)', 'Reporter Name', 'Reporter Phone', 'Reporter Account', 'Operator', 'Area', 'Service Group', 'Service', 'Assignee', 'Description', 'Address', 'Status', 'Priority', 'Resolved Date', 'Time Taken(days)', 'Time Taken(hrs)', 'Time Taken(mins)', 'Time Taken(secs)']\" filename=\"issues.csv\"> <i class=\"icon-cloud-download\"></i> </a> </div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/operator_filter.html',
    "<div> <div class=\"modal-header\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$dismiss()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\"> {{isOperatorFilter ? 'Filter by Operator':'Filter By Assignee'}} </h4> </div> <div class=\"modal-body\"> <div class=\"container-fluid\"> <div class=\"row-col lt\"> <div class=\"list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearchAssignees()\" ng-model=\"search.party\" class=\"form-control form-control-sm\" placeholder=\"Search Operator ...\"> <span class=\"input-group-btn\"> <button ng-click=\"onSearchAssignees()\" class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body hover\"> <div class=\"list\" data-ui-list=\"info\"> <div class=\"list-item\" ng-repeat=\"assignee in assignees\" title=\"{{assignee.name}}\" ng-click=\"filterByWorker(assignee)\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"{{assignee.name}}\" data=\"{{assignee.name}}\" height=\"60\" width=\"60\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <div class=\"item-title\"> {{assignee.name}} <br> <span class=\"text-sm text-muted\"> {{assignee.relation.type}} </span> </div> </div> </div> </div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/reported_time_filter.html',
    "<div> <div class=\"modal-header\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$dismiss()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\">Reported Date - Filters</h4> </div> <div class=\"modal-body\"> <div class=\"container-fluid\"> <div class=\"row\"> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> From </h6> </div> <div pickadate ng-model=\"dateFilters.reportedAt.from\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> To </h6> </div> <div pickadate ng-model=\"dateFilters.reportedAt.to\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> </div> </div> </div> <div class=\"modal-footer\"> <button class=\"btn btn-default\" ng-click=\"$dismiss()\">Cancel</button> <button class=\"btn btn-primary\" ng-click=\"filter()\">Filter</button> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/resolve_time_filter.html',
    "<div> <div class=\"modal-header\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$dismiss()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\">Resolve Date - Filters</h4> </div> <div class=\"modal-body\"> <div class=\"container-fluid\"> <div class=\"row\"> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> From </h6> </div> <div pickadate ng-model=\"dateFilters.resolvedAt.from\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> <div class=\"col-md-6\"> <div class=\"p-a p-l-none p-b-none\"> <h6 class=\"m-a-0\"> To </h6> </div> <div pickadate ng-model=\"dateFilters.resolvedAt.to\" max-date=\"maxDate\" class=\"p-a p-l-none\"></div> </div> </div> </div> </div> <div class=\"modal-footer\"> <button class=\"btn btn-default\" ng-click=\"$dismiss()\">Cancel</button> <button class=\"btn btn-primary\" ng-click=\"filter()\">Filter</button> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/side_subnav.html',
    " <div class=\"row-col bg b-r\"> <div class=\"b-b\"> <div class=\"navbar\"> <ul class=\"nav navbar-nav\"> <li class=\"nav-item\"> <span class=\"navbar-item text-md\"> Issues </span> </li> </ul> </div> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\">Miscellaneous</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ng-class=\"{active:misc == 'all'}\" class=\"nav-item m-b-xs\"> <a ng-click=\"load({resetPage:true, reset:true, misc:'all'})\" class=\"nav-link text-muted block\" title=\"All Reported Issues\"> All </a> </li> <li ng-class=\"{active:misc == 'inbox'}\" class=\"nav-item m-b-xs\"> <a ng-click=\"load({$or: [{ operator: party._id }, { assignee: party._id }], resolvedAt:{$eq: null}, resetPage:true, reset:true, misc: 'inbox'})\" class=\"nav-link text-muted block\" title=\"My Pending Reported & Assigned Issues\"> Inbox </a> </li> <li ng-class=\"{active:misc == 'unattended'}\" class=\"nav-item m-b-xs\"> <a show-if-has-permit=\"servicerequest:attend\" ng-click=\"load({operator:{$eq:null}, resetPage:true, reset:true, misc:'unattended'})\" class=\"nav-link text-muted block\" title=\"Reported Issues Using Other Method Than Call Center\"> Un-Confirmed </a> </li> <li ng-class=\"{active:misc == 'unverified'}\" class=\"nav-item m-b-xs\"> <a show-if-has-permit=\"servicerequest:verify\" ng-click=\"load({operator:{$ne:null}, assignee:{$ne:null}, completedAt:{$ne:null}, verifiedAt:{$eq:null}, resolvedAt:{$eq:null}, resetPage:true, reset:true, misc:'unverified'})\" class=\"nav-link text-muted block\" title=\"Completed Issues Waiting Verification\"> Un-Verified </a> </li> <li ng-class=\"{active:misc == 'unapproved'}\" class=\"nav-item m-b-xs\"> <a show-if-has-permit=\"servicerequest:approve\" ng-click=\"load({operator:{$ne:null}, assignee:{$ne:null}, verifiedAt:{$ne:null}, approvedAt:{$eq:null}, resolvedAt:{$eq:null}, resetPage:true, reset:true, misc:'unapproved'})\" class=\"nav-link text-muted block\" title=\"Verified Issues Waiting Approval\"> Un-Approved </a> </li> <li ng-class=\"{active:misc == 'unresolved'}\" class=\"nav-item m-b-xs\"> <a ng-click=\"load({resolvedAt:{$eq:null}, operator:{$ne:null}, resetPage:true, reset:true, misc: 'unresolved'})\" class=\"nav-link text-muted block\" title=\"Reported Issues Currently Not Resolved\"> Pending </a> </li> <li ng-class=\"{active:misc == 'resolved'}\" class=\"nav-item m-b-xs\"> <a ng-click=\"load({resolvedAt:{$ne:null}, operator:{$ne:null}, resetPage:true, reset:true, misc: 'resolved'})\" class=\"nav-link text-muted block\" title=\"Reported Issues That Have Been Resolved\"> Resolved </a> </li> </ul> </div> </div> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\">Status</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ng-class=\"{active:query.status == status._id}\" class=\"nav-item m-b-xs\" ng-repeat=\"status in statuses | orderBy:'weight'\"> <a ng-click=\"load({'status':status._id, resetPage:true})\" class=\"nav-link text-muted block\"> <span class=\"pull-right text-sm label danger rounded\" style=\"background-color: {{ status.color }}\"> {{ summaries.statuses[status._id] }} </span>{{ status.name }}</a> </li> </ul> </div> </div> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\">Priorities</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ng-class=\"{active:query.priority == priority._id}\" class=\"nav-item m-b-xs\" ng-repeat=\"priority in priorities | orderBy:'weight'\"> <a ng-click=\"load({'priority':priority._id, resetPage:true})\" class=\"nav-link text-muted block\"> <span class=\"pull-right text-sm label danger rounded\" style=\"background-color: {{ priority.color }}\"> {{ summaries.priorities[priority._id] }} </span>{{ priority.name }}</a> </li> </ul> </div> </div> <div class=\"p-a-md\" style=\"display: none\"> <div class=\"m-b text-muted text-xs\"> <a ng-click=\"showReportedAtFilter()\">Reported Date <i class=\"icon-calendar pull-right\"></i> </a> </div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li class=\"nav-link text-muted block\"> From : <span class=\"pull-right text-sm\"> {{ dateFilters.reportedAt.from | date: 'dd-MM-yyyy' }} </span> </li> <li class=\"nav-link text-muted block\"> To : <span class=\"pull-right text-sm\"> {{ dateFilters.reportedAt.to | date: 'dd-MM-yyyy' }} </span> </li> </ul> </div> </div> <div class=\"p-a-md\" style=\"display: none\"> <div class=\"m-b text-muted text-xs\"> <a ng-click=\"showResolvedAtFilter()\">Resolved Date <i class=\"icon-calendar pull-right\"></i> </a> </div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li class=\"nav-link text-muted block\"> From : <span class=\"pull-right text-sm\"> {{ dateFilters.resolvedAt.from | date: 'dd-MM-yyyy' }} </span> </li> <li class=\"nav-link text-muted block\"> To : <span class=\"pull-right text-sm\"> {{ dateFilters.resolvedAt.to | date: 'dd-MM-yyyy' }} </span> </li> </ul> </div> </div> <div class=\"p-a-md\" style=\"display: none\"> <div class=\"m-b text-muted text-xs\"> <span ng-click=\"\">Workers <i class=\"icon-user pull-right\"></i> </span> </div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li class=\"nav-link text-muted block\" ng-click=\"showOperatorFilter()\"> Operator : <span class=\"pull-right text-sm\"> {{ operator ? operator.name : 'N/A' }} </span> </li> <li class=\"nav-link text-muted block\" ng-click=\"showAssigneeFilter()\"> Assignee : <span class=\"pull-right text-sm\"> {{ assignee ? assignee.name : 'N/A' }} </span> </li> </ul> </div> </div> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\">Services</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ng-class=\"{active:query.service == service._id}\" class=\"nav-item m-b-xs\" ng-repeat=\"service in services | orderBy:'name'\"> <a ng-click=\"load({service:service._id, resetPage:true})\" class=\"nav-link text-muted block\"> <span class=\"pull-right text-sm label danger rounded\" style=\"background-color: {{ service.color }}\"> {{ summaries.services[service._id] }} </span> {{ service.name }} </a> </li> </ul> </div> </div> <div class=\"p-a-md\" ng-if=\"jurisdictions.length > 1\"> <div class=\"m-b text-muted text-xs\">Areas</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ng-class=\"{active:query.jurisdiction == jurisdiction._id}\" class=\"nav-item m-b-xs\" ng-repeat=\"jurisdiction in jurisdictions | orderBy:'name'\"> <a ng-click=\"load({'jurisdiction':jurisdiction._id, resetPage:true})\" class=\"nav-link text-muted block\"> <span class=\"pull-right text-sm label danger rounded\" style=\"background-color: {{ jurisdiction.color }}\"> {{ summaries.jurisdictions[jurisdiction._id] }} </span>{{ jurisdiction.name }}</a> </li> </ul> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/worklog_modal.html',
    " <div class=\"modal-header\"> <div class=\"b-b\"> <button type=\"button\" class=\"close pull-right\" ng-click=\"$close()\" aria-hidden=\"true\"> × </button> <h4 class=\"modal-title\">Record Worklog</h4> </div> </div> <div class=\"modal-body\"> <div class=\"box\"> <div class=\"m-l-lg m-r-lg\"> <form role=\"form\"> <div class=\"row m-t-sm\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Item </h6> </div> </div> <div class=\"col-md-12\"> <div class=\"form-group form-material\" title=\"Select Item\"> <oi-select oi-options=\"item.name.en for item in items track by item._id\" ng-model=\"worklog.item\" placeholder=\"Select Item\" class=\"form-control\" oi-select-options=\"{cleanModel: true}\"></oi-select> </div> </div> </div> <div class=\"row m-t-sm\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Quantity </h6> </div> </div> <div class=\"col-md-12\"> <div class=\"form-group\"> <input type=\"text\" ng-model=\"worklog.quantity\" class=\"form-control\" name=\"quantity\" placeholder=\"Quantity\" required> </div> </div> </div> <div class=\"row\"> <div class=\"col-md-12\"> <div class=\"p-a p-l-none\"> <h6 class=\"m-a-0\"> Comment </h6> </div> </div> <div class=\"col-md-12\"> <div class=\"form-group\"> <textarea ng-model=\"worklog.comment\" class=\"form-control\" name=\"comment\" placeholder=\"Comment\" rows=\"3\"></textarea> </div> </div> </div> </form> </div> </div> <div class=\"modal-footer\"> <button class=\"btn btn-default\" title=\"Click to Cancel Worklog\" ng-click=\"$dismiss()\"> Cancel </button> <button class=\"btn btn-primary\" title=\"Click to Save Worklog\" ng-click=\"onWorklog()\"> Save </button> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/worklog.html',
    " <div class=\"padding b-t\"> <h6 class=\"m-b\" title=\"Issue WorkLog\">Materials</h6> <table class=\"table table-bordered table-stats\"> <thead> <tr> <th title=\"Item(Material or Equipment)\"> Item </th> <th title=\"Quantity Used\"> Quantity </th> <th title=\"Unit of Measure\"> Unit </th> </tr> </thead> <tbody> <tr ng-repeat=\"worklog in worklogs\"> <td title=\"{{worklog.item.name.en}}\"> {{worklog.item.name.en}} </td> <td title=\"{{worklog.quantity}}\"> {{worklog.quantity}} </td> <td title=\"{{worklog.item.properties.unit}}\"> {{worklog.item.properties.unit}} </td> </tr> </tbody> </table> </div> "
  );


  $templateCache.put('views/servicerequests/create.html',
    " <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"row-col\"> <div ng-include=\"'views/servicerequests/_partials/create.html'\" class=\"col-xs-12 bg servicerequest\" id=\"detail\"></div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/index.html',
    " <div class=\"page-header padding-top-0\" ng-include=\"'views/parties/_partials/header.html'\"></div> <div class=\"page-content page-content-table\"> <div class=\"page-content-actions padding-left-10\" ng-include=\"'views/parties/_partials/actions.html'\"></div> <table class=\"table\" data-plugin=\"animateList\" data-animate=\"fade\" data-child=\"tr\" ng-include=\"'views/parties/_partials/parties.html'\"></table> <uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" align=\"false\"></uib-pager> </div> "
  );


  $templateCache.put('views/servicerequests/main.html',
    " <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"row-col\"> <div ng-include=\"'views/servicerequests/_partials/side_subnav.html'\" class=\"col-xs-3 w modal fade aside aside-md servicerequests-aside\" id=\"subnav\"></div> <div ng-include=\"'views/servicerequests/_partials/list.html'\" class=\"col-xs-3 w-xl modal fade aside aside-sm b-r servicerequests-list\" id=\"list\"></div> <div ng-include=\"'views/servicerequests/_partials/detail.html'\" ng-show=\"!create\" class=\"col-xs-6 bg servicerequest\" id=\"detail\"></div> <div ng-include=\"'views/servicerequests/_partials/create.html'\" ng-show=\"create\" class=\"col-xs-6 bg servicerequest\" id=\"detail\"></div> </div> </div> </div> "
  );


  $templateCache.put('views/services/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Service Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Service\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit && service._id\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted no-border\" title=\"Click to edit service\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"save()\" class=\"nav-link text-muted no-border\" title=\"Click to save service\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/services/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/services/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"serviceForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Service Group\"> <div ng-show=\"!edit\" class=\"form-group\"> <label title=\"Group\" class=\"floating-label\">Group</label> <input ng-disabled=\"!edit\" ng-model=\"service.group.name.en\" ng-required ng-minlength=\"2\" type=\"text\" name=\"group\" class=\"form-control\"> </div> <div ng-show=\"edit\" class=\"form-group form-material floating\"> <oi-select oi-options=\"item.name.en for item in searchServiceGroups($query) track by item.id\" ng-model=\"service.group\" placeholder=\"Select Group\" class=\"form-control\" oi-select-options=\"{cleanModel: true}\"></oi-select> <label title=\"Group\" class=\"floating-label\">Group</label> </div> </div> <div class=\"m-t-lg\" title=\"Service Type\"> <div ng-show=\"!edit\" class=\"form-group\"> <label title=\"Type\" class=\"floating-label\">Type</label> <input ng-disabled=\"!edit\" ng-model=\"service.type.name.en\" ng-required ng-minlength=\"2\" type=\"text\" name=\"group\" class=\"form-control\"> </div> <div ng-show=\"edit\" class=\"form-group form-material floating\"> <oi-select oi-options=\"item.name.en for item in searchServiceTypes($query) track by item.id\" ng-model=\"service.type\" placeholder=\"Select Type\" class=\"form-control\" oi-select-options=\"{cleanModel: true}\"></oi-select> <label title=\"Type\" class=\"floating-label\">Type</label> </div> </div> <div class=\"m-t-lg\" title=\"Service Priority\"> <div ng-show=\"!edit\" class=\"form-group\"> <label title=\"Priority\" class=\"floating-label\">Priority</label> <input ng-disabled=\"!edit\" ng-model=\"service.priority.name.en\" ng-required ng-minlength=\"2\" type=\"text\" name=\"priority\" class=\"form-control\"> </div> <div ng-show=\"edit\" class=\"form-group form-material floating\"> <oi-select oi-options=\"item.name.en for item in searchPriorities($query) track by item.id\" ng-model=\"service.priority\" placeholder=\"Select Priority\" class=\"form-control\" oi-select-options=\"{cleanModel: true}\"></oi-select> <label title=\"Priority\" class=\"floating-label\">Priority</label> </div> </div> <div class=\"m-t-lg\" title=\"Service Code\"> <div class=\"form-group\"> <label title=\"Service Code\" class=\"floating-label\">Code</label> <input title=\"Service Code\" ng-disabled=\"!edit\" ng-model=\"service.code\" ng-required ng-minlength=\"1\" type=\"text\" name=\"code\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Service Name\"> <div class=\"row\"> <div class=\"form-group col-xs-12 col-sm-6\"> <label title=\"Service Name\" class=\"floating-label\">Name</label> <input title=\"Service Name\" ng-disabled=\"!edit\" ng-model=\"service.name.en\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> <div class=\"form-group col-xs-12 col-sm-6\"> <label title=\"Service Name in Swahili\" class=\"floating-label\">Jina</label> <input title=\"Service Name\" ng-disabled=\"!edit\" ng-model=\"service.name.sw\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> </div> </div> <div class=\"m-t-lg\" title=\"Service Level Agreement\"> <div class=\"form-group\"> <label title=\"Service Level Agreement\" class=\"floating-label\">Service Level Agreement</label> <input title=\"Service Level Agreement\" ng-disabled=\"!edit\" ng-model=\"service.sla.ttr\" min=\"0\" ng-step=\"1\" type=\"number\" name=\"ttr\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Service Color\"> <div class=\"m-t-lg\"> <div class=\"form-group\"> <label title=\"Service Color\" class=\"floating-label\">Service Color(HEX)</label> <color-picker ng-model=\"service.color\" options=\"colorPickerOptions\"> </color-picker> </div> </div> </div> <div class=\"m-t-lg\" title=\"Service Description\"> <div class=\"row\"> <div class=\"form-group col-xs-12 col-sm-6\"> <label class=\"floating-label\">Description</label> <textarea title=\"Service Description\" ng-disabled=\"!edit\" ng-model=\"service.description.en\" msd-elastic name=\"about\" class=\"form-control\" rows=\"3\">\n" +
    "                      </textarea> </div> <div class=\"form-group col-xs-12 col-sm-6\"> <label class=\"floating-label\">Maelezo</label> <textarea title=\"Service Description\" ng-disabled=\"!edit\" ng-model=\"service.description.sw\" msd-elastic name=\"about\" class=\"form-control\" rows=\"3\">\n" +
    "                      </textarea> </div> </div> </div> <div class=\"m-t-lg\" title=\"External Reporting Method Support\"> <div class=\"form-group\"> <div class=\"checkbox-custom checkbox-primary\"> <input ng-show=\"edit\" type=\"checkbox\" ng-model=\"service.flags.external\"> <label title=\"External Reporting Method Support\">Support External Reporting Methods</label> </div> </div> </div> <div class=\"m-t-md\" title=\"Require Account Number\"> <div class=\"form-group\"> <div class=\"checkbox-custom checkbox-primary\"> <input ng-show=\"edit\" type=\"checkbox\" ng-model=\"service.flags.account\"> <label title=\"Require Account Number\">Require Account Number</label> </div> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/services/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Services ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(service)\" class=\"list-item list-item-padded\" ng-repeat=\"service in services\" title=\"{{ service.description.en }}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Service Code\" data=\"{{ service.code }}\" height=\"60\" width=\"60\" color=\"{{ service.color }}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Service Code\" class=\"pull-right text-xs text-muted\"> {{ service.code }} </span> <div class=\"item-title\"> <span title=\"Service Name\" class=\"_500\">{{ service.name.en }}</span> </div> <p title=\"Service Description\" class=\"block text-muted text-ellipsis\"> {{ service.description.en }} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"></div> <span class=\"text-sm text-muted\">Total: {{ total }}</span> </div> </div> "
  );


  $templateCache.put('views/servicetypes/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Service Type Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Service Type\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit && servicetype._id\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted no-border\" title=\"Click to edit service type\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"save()\" class=\"nav-link text-muted no-border\" title=\"Click to save service type\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/servicetypes/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/servicetypes/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"servicetypeForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Service Type Code\"> <div class=\"form-group\"> <label title=\"Service Type Code\" class=\"floating-label\">Code</label> <input title=\"Service Type Code\" ng-disabled=\"!edit\" ng-model=\"servicetype.code\" ng-required ng-minlength=\"1\" type=\"text\" name=\"code\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Service Type Name\"> <div class=\"form-group\"> <label title=\"Service Type Name\" class=\"floating-label\">Name</label> <input title=\"Service Type Name\" ng-disabled=\"!edit\" ng-model=\"servicetype.name.en\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Service Type Color\"> <div class=\"m-t-lg\"> <div class=\"form-group\"> <label title=\"Service Type Color\" class=\"floating-label\">Service Type Color(HEX)</label> <color-picker ng-model=\"servicetype.color\" options=\"colorPickerOptions\"> </color-picker> </div> </div> </div> <div class=\"m-t-lg\" title=\"Service Type Description\"> <div class=\"form-group\"> <label class=\"floating-label\">Description</label> <textarea title=\"Service Type Description\" ng-disabled=\"!edit\" ng-model=\"servicetype.description.en\" msd-elastic name=\"description\" class=\"form-control\" rows=\"3\">\n" +
    "                    </textarea> </div> </div> <div class=\"m-t-lg\" title=\"Is Default\"> <div class=\"form-group\"> <div class=\"checkbox-custom checkbox-primary\"> <input ng-show=\"edit\" type=\"checkbox\" ng-model=\"servicetype.default\"> <label title=\"Is Default\">Is Default</label> </div> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicetypes/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Service Types ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(servicetype)\" class=\"list-item list-item-padded\" ng-repeat=\"servicetype in servicetypes\" title=\"{{servicetype.description.en}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Service Type Code\" data=\"{{servicetype.code}}\" height=\"60\" width=\"60\" color=\"{{servicetype.color}}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Service Type Code\" class=\"pull-right text-xs text-muted\"> {{servicetype.code}} </span> <div class=\"item-title\"> <span title=\"Service Type Name\" class=\"_500\">{{servicetype.name.en}}</span> </div> <p title=\"Service Type Description\" class=\"block text-muted text-ellipsis\"> {{servicetype.description.en}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"></div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/settings/_partials/settings.html',
    " <div class=\"col-md-12\"> <letter-avatar data=\"{{settings.name}}\" height=\"60\" width=\"60\" shape=\"round\"> </letter-avatar> </div> <div> <form name=\"profileForm\" role=\"form\" autocomplete=\"off\"> <div class=\"col-md-4 margin-top-40\"> <div class=\"form-group form-material floating\"> <input type=\"text\" class=\"form-control\" name=\"name\" ng-model=\"settings.name\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Name</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"text\" class=\"form-control\" name=\"phoneNumber\" ng-model=\"settings.phone\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Phone Number</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"email\" class=\"form-control\" name=\"email\" ng-model=\"settings.email\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Email</label> </div> </div> <div class=\"col-md-4 margin-top-40\"> <div class=\"form-group form-material floating\"> <input type=\"text\" class=\"form-control\" name=\"currency\" ng-model=\"settings.currency\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Currency</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"text\" class=\"form-control\" name=\"dateFormat\" ng-model=\"settings.dateFormat\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Date Format</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"text\" class=\"form-control\" name=\"timeFormat\" ng-model=\"settings.timeFormat\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Time Format</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"text\" class=\"form-control\" name=\"defaultPassword\" ng-model=\"settings.defaultPassword\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Default Password</label> </div> </div> </form> </div> "
  );


  $templateCache.put('views/settings/index.html',
    " <div class=\"container settings\"> <div class=\"row\"> <div class=\"col-md-offset-1\"> <div class=\"page-header margin-top-30 padding-left-20\"> <div class=\"page-header-actions\"> <button ng-click=\"onEdit()\" ng-hide=\"edit\" type=\"button\" class=\"btn btn-outline btn-default btn-md empty-btn\" title=\"Click to edit settings\"> <i class=\"icon icon-pencil\" aria-hidden=\"true\"></i> </button> <button ng-click=\"save()\" ng-show=\"edit\" type=\"button\" class=\"btn btn-primary btn-md empty-btn\" title=\"Click to save settings\"> Save </button> <button ng-click=\"onClose()\" ng-show=\"edit\" type=\"button\" class=\"btn btn-outline btn-default btn-md empty-btn\" title=\"Cancel settings edits\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </button> </div> </div> <div class=\"page-content page-content-table margin-top-20\"> <div class=\"container\"> <div class=\"row\"> <div ng-include=\"'views/settings/_partials/settings.html'\"></div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/statuses/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Status Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Status\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit && status._id\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted no-border\" title=\"Click to edit status\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"save()\" class=\"nav-link text-muted no-border\" title=\"Click to save status\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/statuses/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/statuses/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"statusForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Status Name\"> <div class=\"row\"> <div class=\"form-group col-xs-12 col-sm-6\"> <label title=\"Status Name\" class=\"floating-label\">Name</label> <input ng-disabled=\"!edit\" ng-model=\"status.name.en\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> <div class=\"form-group col-xs-12 col-sm-6\"> <label title=\"Status Name in Swahili\" class=\"floating-label\">Jina</label> <input ng-disabled=\"!edit\" ng-model=\"status.name.sw\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> </div> </div> <div class=\"m-t-lg\" title=\"Status Weight\"> <div class=\"form-group\"> <label title=\"Status Weight\" class=\"floating-label\">Weight</label> <input ng-disabled=\"!edit\" ng-model=\"status.weight\" ng-required type=\"number\" name=\"name\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Status Color\"> <div class=\"m-t-lg\"> <div class=\"form-group\"> <label title=\"Status Color\" class=\"floating-label\">Status Color(HEX)</label> <color-picker ng-model=\"status.color\" options=\"colorPickerOptions\"> </color-picker> </div> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/statuses/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Statuses ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(status)\" class=\"list-item list-item-padded\" ng-repeat=\"status in statuses\" title=\"{{ status.about }}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Status Visual Color\" data=\"{{ status.name.en }}\" height=\"60\" width=\"60\" color=\"{{ status.color }}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Status Weight\" class=\"pull-right text-xs text-muted\"> {{ status.weight }} </span> <div class=\"item-title\" title=\"Status Name\"> <span class=\"_500\">{{ status.name.en }}</span> </div> <p title=\"Status Description\" class=\"block text-muted text-ellipsis\"> {{ status.name.en }} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"></div> <span class=\"text-sm text-muted\">Total: {{ total }}</span> </div> </div> "
  );


  $templateCache.put('views/zones/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Zone Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit \" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Zone\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit && zone._id\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted no-border\" title=\"Click to edit zone\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item b-l p-l p-r\"> <a ng-click=\"save()\" class=\"nav-link text-muted no-border\" title=\"Click to save zone\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/zones/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/zones/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"zoneForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Zone Code\"> <div class=\"form-group\"> <label title=\"Zone Code\" class=\"floating-label\">Code</label> <input title=\"Zone Code\" ng-disabled=\"!edit\" ng-model=\"zone.code\" ng-required ng-minlength=\"1\" type=\"text\" name=\"code\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Zone Name\"> <div class=\"form-group\"> <label title=\"Zone Name\" class=\"floating-label\">Name</label> <input title=\"Zone Name\" ng-disabled=\"!edit\" ng-model=\"zone.name.en\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> </div> </div> <div class=\"m-t-lg\" title=\"Zone Color\"> <div class=\"m-t-lg\"> <div class=\"form-group\"> <label title=\"Zone Color\" class=\"floating-label\">Zone Color(HEX)</label> <color-picker ng-model=\"zone.color\" options=\"colorPickerOptions\"> </color-picker> </div> </div> </div> <div class=\"m-t-lg\" title=\"Zone Description\"> <div class=\"form-group\"> <label class=\"floating-label\">Description</label> <textarea title=\"Zone Description\" ng-disabled=\"!edit\" ng-model=\"zone.description.en\" msd-elastic name=\"description\" class=\"form-control\" rows=\"3\">\n" +
    "                    </textarea> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/zones/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Zones ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(zone)\" class=\"list-item list-item-padded\" ng-repeat=\"zone in zones\" title=\"{{zone.description.en}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Zone Code\" data=\"{{zone.code}}\" height=\"60\" width=\"60\" color=\"{{zone.color}}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Zone Code\" class=\"pull-right text-xs text-muted\"> {{zone.code}} </span> <div class=\"item-title\"> <span title=\"Zone Name\" class=\"_500\">{{zone.name.en}}</span> </div> <p title=\"Zone Description\" class=\"block text-muted text-ellipsis\"> {{zone.description.en}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"></div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );

}]);
