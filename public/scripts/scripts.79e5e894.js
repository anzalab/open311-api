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
    'angucomplete-alt',
    'cgPrompt',
    'checklist-model',
    'ui-listView',
    'ngCsv',
    'monospaced.elastic',
    'oi.select',
    'uz.mailto',
    'mp.colorPicker',
    'AngularPrint',
    'angular-echarts',
    'btford.socket-io',
    'focus-if',
    'infinite-scroll'
  ])
  .config(function (
    $stateProvider, $urlRouterProvider,
    $authProvider, cfpLoadingBarProvider, ENV
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

    //unmatched route handler
    $urlRouterProvider.otherwise('/servicerequests');

    //configure application states
    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'views/app.html',
        controller: 'AppCtrl',
        resolve: {
          party: function ($auth) {
            return $auth.getProfile();
          }
        }
      })
      .state('app.manage', {
        abstract: true,
        templateUrl: 'views/manage/main.html'
      })
      .state('app.overviews', {
        url: '/overviews',
        templateUrl: 'views/dashboards/overviews.html',
        controller: 'DashboardOverviewCtrl',
        data: {
          authenticated: true
        },
        resolve: {
          overviews: function (Summary) {
            return Summary.overviews();
          }
        }
      }).state('app.standings', {
        url: '/standings',
        templateUrl: 'views/dashboards/standings.html',
        controller: 'DashboardStandingCtrl',
        data: {
          authenticated: true
        },
        resolve: {
          standings: function (Summary) {
            return Summary.standings();
          }
        }
      });

  })
  .run(function ($rootScope, ngNotify, ENV) {

    //expose environment to $rootScope
    $rootScope.ENV = ENV;

    //configure ngNotify
    ngNotify.config({
      position: 'top',
      duration: 5000,
      button: true,
      theme: 'pastel'
    });

  });

'use strict';

angular.module('ng311')

.constant('ENV', {name:'production',owner:'DAWASCO',title:'SmartDawasco',version:'v0.1.0',description:'Citizen Feedback System',apiEndPoint:{mobile:'',web:''},socketEndPoint:{mobile:'',web:''},socketEnable:false,settings:{name:'open311',email:'example@example.com',phone:'(000) 000 000 000',currency:'USD',dateFormat:'dd/MM/yyyy',timeFormat:'hh:mm:ss',defaultPassword:'guest'}})

;
'use strict';

/**
 *@description party authentication workflows configurations
 */
angular
  .module('ng311')
  .config(function ($stateProvider) {

    //party authentications flows states
    $stateProvider
      .state('change', {
        url: '/change',
        templateUrl: 'views/auth/change.html',
        controller: 'AuthChangeCtrl'
      })
      .state('forgot', {
        url: '/forgot',
        templateUrl: 'views/auth/forgot.html',
        controller: 'AuthForgotCtrl'
      })
      .state('recover', {
        url: '/recover/:token',
        templateUrl: 'views/auth/recover.html',
        controller: 'AuthRecoverCtrl'
      })
      .state('confirm', {
        url: '/confirm/:token',
        resolve: {
          confirm: function ($rootScope, $state, $stateParams, Party) {
            Party.confirm({
              token: $stateParams.token
            }).then(function (response) {
              $rootScope.$broadcast('confirmSuccess', response);
              $state.go('signin');
            }).catch(function (error) {
              $rootScope.$broadcast('confirmError', error);
              $state.go('signin');
            });
          }
        }
      }).state('unlock', {
        url: '/unlock/:token',
        resolve: {
          unlock: function ($rootScope, $state, $stateParams, Party) {
            Party.unlock({
              token: $stateParams.token
            }).then(function (response) {
              $rootScope.$broadcast('unlockSuccess', response);
              $state.go('signin');
            }).catch(function (error) {
              $rootScope.$broadcast('unlockError', error);
              $state.go('signin');
            });
          }
        }
      })
      .state('app.profile', {
        url: '/profile',
        templateUrl: 'views/auth/profile.html',
        controller: 'AuthProfileCtrl',
        data: {
          authenticated: true
        }
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
angular.module('ng311')
  .factory('Utils', function ($window, ENV) {
    var utils = {};

    /**
     * @description convert provided path to link
     * @param  {String|Array} path valid url
     * @return {String}
     */
    utils.asLink = function (path) {
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
angular.module('ng311')
  .factory('socket', function (ENV, Utils, socketFactory) {

    //no op socket
    var socket = {};

    if (ENV && ENV.socketEnable) {
      //socket endpoint
      var socketEndPoint = (ENV.socketEndPoint || {}.web) || Utils.asLink('');

      //initialize socket.io
      socket = socketFactory({
        ioSocket: io(socketEndPoint)
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
  .factory('Permission', function ($http, $resource, Utils) {

    //create permission resource
    var Permission = $resource(Utils.asLink(['permissions', ':id']), {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
    });


    /**
     * @description find permissions with pagination
     * @param  {Object} params [description]
     */
    Permission.find = function (params) {
      return $http.get(Utils.asLink('permissions'), {
          params: params
        })
        .then(function (response) {

          //map plain permission object to resource instances
          var permissions =
            response.data.permissions.map(function (permission) {
              //create permission as a resource instance
              return new Permission(permission);
            });

          //return paginated response
          return {
            permissions: permissions,
            total: response.data.count
          };
        });
    };

    return Permission;
  });

'use strict';

/**
 * @ngdoc service
 * @name ng311.Priority
 * @description
 * # Priority
 * Factory in the ng311.
 */
angular
  .module('ng311')
  .factory('Priority', function ($http, $resource, Utils) {

    //create priority resource
    var Priority = $resource(Utils.asLink(['priorities', ':id']), {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
    });


    /**
     * @description find priority with pagination
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Priority.find = function (params) {
      return $http.get(Utils.asLink('priorities'), {
          params: params
        })
        .then(function (response) {

          //map plain priority object to resource instances
          var priorities = response.data.priorities.map(function (
            priority) {
            //create priority as a resource instance
            return new Priority(priority);
          });

          //return paginated response
          return {
            priorities: priorities,
            total: response.data.count
          };
        });
    };

    return Priority;

  });

'use strict';

/**
 * @ngdoc service
 * @name ng311.Status
 * @description
 * # Status
 * Factory in the ng311.
 */
angular
  .module('ng311')
  .factory('Status', function ($http, $resource, Utils) {

    //create status resource
    var Status = $resource(Utils.asLink(['statuses', ':id']), {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
    });


    /**
     * @description find status with pagination
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Status.find = function (params) {
      return $http.get(Utils.asLink('statuses'), {
          params: params
        })
        .then(function (response) {

          //map plain status object to resource instances
          var statuses = response.data.statuses.map(function (status) {
            //create status as a resource instance
            return new Status(status);
          });

          //return paginated response
          return {
            statuses: statuses,
            total: response.data.count
          };
        });
    };

    return Status;

  });

'use strict';

/**
 * @ngdoc service
 * @name ng311.Comment
 * @description
 * # Comment
 * Factory in the ng311.
 */
angular
  .module('ng311')
  .factory('Comment', function ($http, $resource, Utils) {

    //create comment resource
    var Comment = $resource(Utils.asLink(['comments', ':id']), {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
    });


    /**
     * @description find comment with pagination
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Comment.find = function (params) {
      return $http.get(Utils.asLink('comments'), {
          params: params
        })
        .then(function (response) {

          //map plain comment object to resource instances
          var comments = response.data.comments.map(function (comment) {
            //create comment as a resource instance
            return new Comment(comment);
          });

          //return paginated response
          return {
            comments: comments,
            total: response.data.count
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
  .controller('MainCtrl', function ($rootScope, $scope, $state, ngNotify,
    ngToast, socket) {
    //TODO show signin progress

    $scope.onAllIssues = function () {
      $rootScope.$broadcast('servicerequest:list');
    };

    //replace browser scroll with richer scroller
    // angular.element('html').niceScroll({
    //   cursorcolor: '#A3AFB7',
    //   cursorwidth: '6px'
    // });

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
        type: 'warn'
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
        type: 'success'
      });

    }

    //listen errors and notify
    $rootScope.$on('appError', onError);
    $rootScope.$on('signinError', onError);

    //listen success and notify
    $rootScope.$on('appSuccess', onSuccess);

    //TODO fire welcome message
    // $rootScope.$on('signinSuccess', onSuccess);

    /**
     * @description show and hide application aside
     */
    $scope.switch = function () {

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
    $rootScope.$on('signinSuccess', function (event, response) {

      //obtain signin party(user)
      var party = _.get(response, 'data.party');

      //if party is operator and has sipNumber
      //subscribe to web socket for call picked events
      if (socket && party && socket.on && party.sipNumber) {

        //ensure socket connection
        // socket.connect();

        //prepare sip socket event name
        $rootScope.sipEvent = [
          'socket:',
          party.sipNumber,
          '-call-picked'
        ].join('');

        socket.on($rootScope.sipEvent, function (data) {

          //notify new call
          ngToast.create({
            className: 'info',
            content: 'New Call Received',
            dismissButton: true
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
    $rootScope.$on('signoutSuccess', function () {
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
  .controller('AppCtrl', function ($rootScope, $scope, ENV, party) {
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

    $scope.$watch('$root.settings', function () {
      $scope.settings = $rootScope.settings;
    });

  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:AuthChangeCtrl
 * @description
 * # AuthChangeCtrl
 * Controller of the ng311
 */
angular
  .module('ng311')
  .controller('AuthChangeCtrl', function ($rootScope, $scope, $state, $auth,
    Party) {

    //new party password
    $scope.party = {
      _id: $rootScope.party._id,
      password: ''
    };

    /**
     * @submit password change request
     * @return {[type]} [description]
     */
    $scope.change = function () {
      //update current party password
      Party.change($scope.party).then(function (response) {
          //signout current party
          $auth.signout().then(function () {
            //notify
            $rootScope.$broadcast('appSuccess', response);
            $state.go('signin');

          });
        })
        .catch(function (error) {
          //notify error
          $rootScope.$broadcast('appError', error);
          $state.go('app.home');
        });
    }

  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:AuthForgotCtrl
 * @description
 * # AuthForgotCtrl
 * Controller of the ng311
 */
angular
  .module('ng311')
  .controller('AuthForgotCtrl', function ($rootScope, $scope, $state, Party) {

    //recovery email address
    $scope.party = {
      email: ''
    };


    /**
     * @submit forgot password request
     * @return {[type]} [description]
     */
    $scope.forgot = function () {
      Party.requestRecover($scope.party).then(function (response) {
          $rootScope.$broadcast('appSuccess', response);
          $state.go('signin');
        })
        .catch(function (error) {
          $rootScope.$broadcast('appError', error);
          $state.go('signin');
        });
    }
  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.controller:AuthRecoverCtrl
 * @description
 * # AuthRecoverCtrl
 * Controller of the ng311
 */
angular
  .module('ng311')
  .controller('AuthRecoverCtrl', function ($rootScope, $scope, $state,
    $stateParams, Party) {

    //new party password
    $scope.party = {
      token: $stateParams.token,
      password: ''
    };


    /**
     * @submit recover party password
     * @return {[type]} [description]
     */
    $scope.recover = function () {
      //update current party password
      Party.recover($scope.party).then(function (response) {
        $rootScope.$broadcast('appSuccess', response);
        $state.go('signin');
      }).catch(function (error) {
        $rootScope.$broadcast('appError', error);
        $state.go('signin');
      });
    }

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
  .controller('AuthProfileCtrl', function (
    $rootScope, $scope, $state, $auth, Party
  ) {

    //signal if its editing process
    $scope.edit = false;

    $scope.canSave = true;

    $scope.passwordDontMatch = false;

    //use only editable properties
    $scope.party = new Party({
      _id: $rootScope.party._id,
      name: $rootScope.party.name,
      email: $rootScope.party.email,
      phone: $rootScope.party.phone
    });


    $scope.onEdit = function () {
      $scope.edit = true;
    };


    $scope.onClose = function () {
      $scope.edit = false;
    };


    $scope.onConfirmPassword = function () {
      if (!$scope.party.confirm || !$scope.party.password) {
        $scope.passwordDontMatch = false;
      } else {
        $scope.passwordDontMatch = !($scope.party.password === $scope.party
          .confirm);
        $scope.canSave =
          ($scope.party.password.length >= 8) &&
          ($scope.party.password === $scope.party.confirm);
      }
    };


    $scope.onPasswordChange = function () {
      if (!$scope.party.password) {
        $scope.canSave = true;
      } else {
        $scope.canSave =
          ($scope.party.password.length >= 8) &&
          ($scope.party.password === $scope.party.confirm);
      }
    };


    /**
     * @description save edited customer
     */
    $scope.save = function () {
      //check if password edited
      var passwordChanged = !!$scope.party.password;

      //TODO show input prompt
      //TODO show loading mask
      $scope.party.$update().then(function (response) {
          if (passwordChanged) {
            //signout current party
            return $auth.signout();
          } else {
            return response;
          }
        })
        .then(function (response) {
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
        .catch(function (error) {
          $rootScope.$broadcast('appError', error);
          $state.go('app.profile');
        });
    };

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
angular
  .module('ng311')
  .directive('showIfState', function ($state) {
    return {
      restrict: 'A',
      scope: {
        showIfState: '@'
      },
      link: function (scope, element) {
        scope.$watch(function () {
          return $state.is(scope.showIfState);
        }, function (isState) {

          if (isState) {
            element.css('display', 'inherit');
          } else {
            element.css('display', 'none');
          }

        });
      }
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
angular
  .module('ng311')
  .directive('hideIfState', function ($state) {
    return {
      restrict: 'A',
      scope: {
        hideIfState: '@'
      },
      link: function (scope, element) {
        scope.$watch(function () {
          return $state.is(scope.hideIfState);
        }, function (isState) {

          if (isState) {
            element.css('display', 'none');
          } else {
            element.css('display', 'inherit');
          }

        });
      }
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name ng311.directive:LetterAvatar
 * @description
 * # LetterAvatar
 */
angular
  .module('ng311')
  .directive('ngEnter', function () {

    return function (scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
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
angular
  .module('ng311')
  .directive('letterAvatar', function () {

    //default settings
    var defaultSettings = {
      alphabetcolors: [
        '#5A8770', '#B2B7BB', '#6FA9AB', '#F5AF29',
        '#0088B9', '#F18636', '#D93A37', '#A6B12E',
        '#5C9BBC', '#F5888D', '#9A89B5', '#407887',
        '#9A89B5', '#5A8770', '#D33F33', '#A2B01F',
        '#F0B126', '#0087BF', '#F18636', '#0087BF',
        '#B2B7BB', '#72ACAE', '#9C8AB4', '#5A8770',
        '#EEB424', '#407887'
      ],
      textColor: '#ffffff',
      defaultBorder: 'border:5px solid white',
      fontsize: 30, // unit in pixels
      height: 50, // unit in pixels
      width: 50, // unit in pixels
      fontWeight: 400, //
      charCount: 1,
      fontFamily: 'Lato,HelveticaNeue-Light,Helvetica Neue Light,Helvetica Neue,Helvetica, Arial,Lucida Grande, sans-serif',
      base: 'data:image/svg+xml;base64,',
      radius: 'border-radius:30px;'

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

      var svgTag = angular.element('<svg></svg>')
        .attr({
          'xmlns': 'http://www.w3.org/2000/svg',
          'pointer-events': 'none',
          'width': width,
          'height': height
        })
        .css({
          'background-color': color,
          'width': width + 'px',
          'height': height + 'px'
        });

      return svgTag;
    }

    function getCharacterObject(character, textColor, fontFamily, fontWeight,
      fontsize) {
      var textTag = angular.element('<text text-anchor="middle"></text>')
        .attr({
          'y': '50%',
          'x': '50%',
          'dy': '0.35em',
          'pointer-events': 'auto',
          'fill': textColor,
          'font-family': fontFamily
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
        alphabetcolors: '=alphabetcolors'
      },
      link: function (scope, element, attrs) {
        var params = {
          charCount: isNotNull(attrs.charcount) ? attrs.charcount : defaultSettings
            .charCount,
          data: attrs.data,
          textColor: defaultSettings.textColor,
          height: isNotNull(attrs.height) ? attrs.height : defaultSettings
            .height,
          width: isNotNull(attrs.width) ? attrs.width : defaultSettings.width,
          fontsize: isNotNull(attrs.fontsize) ? attrs.fontsize : defaultSettings
            .fontsize,
          fontWeight: isNotNull(attrs.fontweight) ? attrs.fontweight : defaultSettings
            .fontWeight,
          fontFamily: isNotNull(attrs.fontfamily) ? attrs.fontfamily : defaultSettings
            .fontFamily,
          avatarBorderStyle: attrs.avatarcustomborder,
          avatardefaultBorder: attrs.avatarborder,
          defaultBorder: defaultSettings.defaultBorder,
          shape: attrs.shape,
          color: attrs.color,
          clazz: attrs.class,
          alphabetcolors: scope.alphabetcolors || defaultSettings.alphabetcolors,
          title: attrs.title
        };

        var c = params.data.substr(0, params.charCount).toUpperCase();
        var cobj = getCharacterObject(c, params.textColor, params.fontFamily,
          params.fontWeight, params.fontsize);
        var colorIndex = '';
        var color = params.color;

        if (!color) {
          if (c.charCodeAt(0) < 65) {
            color = getRandomColors();
          } else {
            var seed = Math.ceil(Math.random() * 99);
            colorIndex = Math.floor((c.charCodeAt(0) + seed) % params.alphabetcolors
              .length);
            color = params.alphabetcolors[colorIndex];
          }
        }


        var svg = getImgTag(params.width, params.height, color);
        svg.append(cobj);
        var lvcomponent = angular.element('<div>').append(svg.clone()).html();
        /*global unescape:false*/
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
            component = '<img src=' + base + svgHtml + ' style="' +
              roundStyle + '" class="' + params.clazz + '" title="' +
              params.title + '"/>';
          }
        } else {
          component = '<img src=' + base + svgHtml + ' style="' + _style +
            '" class="' + params.clazz + '" />';
        }
        element.replaceWith(component);
      }
    };

  });

'use strict';

/**
 * @ngdoc service
 * @name ng311.ServiceRequest
 * @description
 * # ServiceRequest
 * Factory in the ng311.
 */
angular
  .module('ng311')
  .factory('ServiceRequest', function (
    $http, $resource, $filter, Utils, Mailto
  ) {

    //create servicerequest resource
    var ServiceRequest = $resource(Utils.asLink(['servicerequests', ':id']), {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
    });


    /**
     * @description find servicerequest with pagination
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    ServiceRequest.find = function (params) {
      return $http.get(Utils.asLink('servicerequests'), {
          params: params
        })
        .then(function (response) {

          //map plain servicerequest object to resource instances
          var servicerequests = response.data.servicerequests.map(
            function (servicerequest) {
              //create servicerequest as a resource instance
              return new ServiceRequest(servicerequest);
            });

          //return paginated response
          return {
            servicerequests: servicerequests,
            total: response.data.count,
            pages: response.data.pages
          };
        });
    };

    /**
     * @description convert a report to email
     * @param  {Object} report current report in the scope
     * @return {String} valid mailto string to bind into href        
     */
    ServiceRequest.toEmail = function (issue) {
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
        'Regards.'
      ].join('');

      //prepare e-mail send option
      var recipient = _.get(issue, 'jurisdiction.email', '');
      var options = {
        subject: [issue.service.name, issue.code].join(' - #'),
        body: body
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
  .controller('ServiceRequestCreateCtrl', function (
    $rootScope, $scope, $state, $stateParams,
    ServiceRequest, endpoints) {

    //action performed by this controller
    $scope.action = 'Create';

    $scope.edit = true;

    $scope.groups = endpoints.servicegroups.servicegroups;
    $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;
    $scope.services = endpoints.services.services;

    //instantiate new servicerequest
    $scope.servicerequest = new ServiceRequest({
      call: {
        startedAt: new Date()
      },
      reporter: ($stateParams || {}).reporter || {},
      jurisdiction: ($stateParams || {}).jurisdiction
    });


    /**
     * @description save created servicerequest
     */
    $scope.save = function () {

      $scope.create = false;
      $scope.updated = true;

      //set call end time
      if (!$scope.servicerequest._id) {
        $scope.servicerequest.call.endedAt = new Date();
      }

      $scope.servicerequest.$save().then(function (response) {

          response = response || {};

          response.message =
            response.message || 'Service Request Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('servicerequest:create:success', response);

          $rootScope.$broadcast('app:servicerequests:reload');

          $state.go('app.servicerequests.list');

        })
        .catch(function (error) {
          $rootScope.$broadcast('appError', error);
          $rootScope.$broadcast('servicerequest:create:error', error);
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
  .controller('ServiceRequestIndexCtrl', function (
    $rootScope, $scope, $state, ServiceRequest) {

    //servicerequests in the scope
    $scope.spin = false;
    $scope.busy = false;
    $scope.servicerequests = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function () {
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
    $scope.find = function () {
      //start show spinner
      $scope.spin = true;
      $scope.busy = true;

      ServiceRequest.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1
        },
        query: {
          'relation.name': 'Internal'
        },
        q: $scope.q
      }).then(function (response) {
        //update scope with servicerequests when done loading
        $scope.servicerequests = response.servicerequests;
        $scope.total = response.total;
        $scope.page = response.page;
        $scope.spin = false;
        $scope.busy = false;
      }).catch(function (error) {
        $scope.spin = false;
        $scope.busy = false;
      });
    };


    //check whether servicerequests will paginate
    $scope.willPaginate = function () {
      var willPaginate =
        ($scope.servicerequests && $scope.total && $scope.total > $scope.limit);
      return willPaginate;
    };


    //pre load servicerequests on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:servicerequests:reload', function () {
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
  .controller('ServiceRequestMainCtrl', function (
    $rootScope, $scope, $state, prompt, Party, ServiceRequest,
    Comment, Summary, endpoints, party
  ) {

    //servicerequests in the scope
    $scope.spin = false;
    $scope.servicerequests = [];
    $scope.comments = [];
    $scope.servicerequest = new ServiceRequest({
      call: {
        startedAt: new Date()
      }
    });
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;
    $scope.note = {};
    $scope.updated = false;

    $scope.search = {};

    //signal create mode
    $scope.create = false;

    //bind states
    $scope.priorities = endpoints.priorities.priorities;
    $scope.statuses = endpoints.statuses.statuses;
    $scope.services = endpoints.services.services;
    $scope.jurisdictions = endpoints.jurisdictions.jurisdictions;
    $scope.party = party;
    // $scope.assignees = assignee.parties;
    $scope.summaries = endpoints.summaries;

    //listen for create event
    $rootScope.$on('servicerequest:create', function () {
      $scope.servicerequest = new ServiceRequest({
        call: {
          startedAt: new Date()
        }
      });
      $scope.create = true;
    });

    $rootScope.$on('servicerequest:list', function () {
      $scope.find();
      $scope.create = false;
    });

    /**
     * listen for received call picked events and filter
     * issue list based on reporter details(i.e phone number)
     */
    var callPickedDeregister = $rootScope.$on('call picked', function (event,
      data) {

      if (data && data.phone) {
        $scope.filterByReporter(data.phone, {
          'reporter.phone': data.phone
        });
      }

    });
    $scope.$on('$destroy', callPickedDeregister);


    /**
     * set current service request
     */
    $scope.select = function (servicerequest) {

      //sort comments in desc order
      if (servicerequest && servicerequest._id) {
        //update scope service request ref
        $scope.servicerequest = servicerequest;

        $scope.mailTo = ServiceRequest.toEmail(servicerequest);

        //load service request comments
        $scope.loadComment(servicerequest);

      }

      $scope.create = false;

    };

    /**
     * cancel create operation
     */
    $scope.cancel = function () {
      // $scope.servicerequest = _.first($scope.servicerequests);
      $scope.select(_.first($scope.servicerequests));
      $scope.create = false;
    };

    /**
     * assign a person to work on the issue
     */
    $scope.assign = function (assignee) {
      if (assignee) {
        $scope.servicerequest.assignee = assignee._id;
        if (!$scope.servicerequest.resolvedAt) {
          $scope.servicerequest.$update().then(function (response) {
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
    $scope.comment = function () {

      //TODO notify about the comment saved
      if ($scope.note && $scope.note.content) {
        var comment = new Comment({
          request: $scope.servicerequest._id,
          commentator: party._id,
          content: $scope.note.content
        });

        //clear note
        $scope.note = {};

        comment.$save().then(function (response) {
          $scope.select($scope.servicerequest);
          $scope.note = {};
          $scope.updated = true;
          $rootScope.$broadcast('app:comments:reload');
        }).catch(function ( /*error*/ ) {
          //TODO signal error
          $scope.note = {};
        });

      }
    };

    $scope.changePriority = function (priority) {
      if (priority) {
        $scope.servicerequest.priority = priority;
      }

      if (!$scope.servicerequest.resolvedAt) {
        $scope.servicerequest.$update().then(function (response) {
          // $scope.servicerequest = response;
          $scope.select(response);
          $scope.updated = true;
          $rootScope.$broadcast('app:servicerequests:reload');
        });
      }
    };

    $scope.changeStatus = function (status) {
      if (status) {
        $scope.servicerequest.status = status;
      }

      if (!$scope.servicerequest.resolvedAt) {
        $scope.servicerequest.$update().then(function (response) {
          // $scope.servicerequest = response;
          $scope.select(response);
          $scope.updated = true;
          $rootScope.$broadcast('app:servicerequests:reload');
        });
      }
    };

    /**
     * close and resolve issue
     */
    $scope.onClose = function () {
      prompt({
        title: 'Resolve Issue',
        message: 'Are you sure you want to mark this issue as resolved?',
        buttons: [{
          label: 'Yes',
          primary: true,
        }, {
          label: 'No',
          cancel: true
        }]
      }).then(function () {
        if (!$scope.servicerequest.resolvedAt) {
          $scope.servicerequest.resolvedAt = new Date();
          $scope.servicerequest.$update().then(function (response) {
            // $scope.servicerequest = response;
            $scope.select(response);
            $scope.updated = true;
            $rootScope.$broadcast('app:servicerequests:reload');

            response = response || {};

            response.message =
              response.message || 'Issue Marked As Resolved';

            $rootScope.$broadcast('appSuccess', response);

          });
        }
      }).catch(function () {});
    };

    /**
     * re-open close issue
     */
    $scope.onReOpen = function () {
      prompt({
        title: 'Re-Open Issue',
        message: 'Are you sure you want to re-open this issue?',
        buttons: [{
          label: 'Yes',
          primary: true,
        }, {
          label: 'No',
          cancel: true
        }]
      }).then(function () {
        if ($scope.servicerequest.resolvedAt) {
          $scope.servicerequest.resolvedAt = null;
          $scope.servicerequest.$update().then(function (response) {
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
      }).catch(function () {});
    };


    /**
     * Initialize new issue creation with reporter details
     */
    $scope.onCopy = function () {
      $state.go('app.create_servicerequests', {
        reporter: $scope.servicerequest.reporter,
        jurisdiction: $scope.servicerequest.jurisdiction
      });
    };

    /**
     * @description delete servicerequest
     */
    $scope.delete = function (servicerequest) {
      servicerequest
        .$delete()
        .then(function (response) {

          response = response || {};

          response.message =
            response.message || 'Issue Deleted Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('servicerequest:delete:success', response);

          $rootScope.$broadcast('app:servicerequests:reload');

        })
        .catch(function (error) {
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
    $scope.onSearch = function () {
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
    $scope.filterByReporter = function (q, query) {
      $scope.search.q = q;
      $scope.load(query, true);
    };

    /**
     * search assignes
     * @return {[type]} [description]
     */
    $scope.onSearchAssignees = function () {
      if ($scope.search.party && $scope.search.party.length >= 2) {
        Party.find({
          query: {
            deletedAt: {
              $eq: null
            },
            'relation.name': 'Internal',
            'relation.type': 'Worker'
          },
          q: $scope.search.party
        }).then(function (response) {
          $scope.assignees = response.parties;
        }).catch(function ( /*error*/ ) {
          $scope.assignees = [];
        });
      }
    };


    $scope.load = function (query, skipClearSearch) {
      if (!skipClearSearch) {
        $scope.search = {};
        $scope.q = undefined;
      }
      $scope.find(query);
    };

    $scope.loadComment = function (servicerequest) {
      if (servicerequest && servicerequest._id) {
        Comment.find({
          sort: {
            createdAt: -1
          },
          query: {
            request: servicerequest._id
          }
        }).then(function (response) {
          $scope.comments = response.comments;
        });
      }
    };

    /**
     * Load all service request based on current filters
     * @return {[type]} [description]
     */
    $scope.all = function () {
      $scope.page = 1;
      $scope.limit = $scope.total;
      $scope.find();
    };

    /**
     * @description load servicerequests
     */
    $scope.find = function (query) {
      //ensure query
      query = _.merge({ resolvedAt: null }, query);

      //start sho spinner
      $scope.spin = true;

      //reset pagination
      if (query && query.resetPage) {
        $scope.page = 1;
        delete query.resetPage;
      }

      //track active ui based on query
      if (query.reset) {
        delete query.reset;
        $scope.query = query;
      } else {
        $scope.query = _.merge({}, $scope.query, query);
      }

      ServiceRequest.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          createdAt: -1
        },
        query: $scope.query,
        q: $scope.q
      }).then(function (response) {
        //update scope with servicerequests when done loading
        $scope.servicerequests = response.servicerequests;
        if ($scope.updated) {
          $scope.updated = false;
        } else {
          $scope.select(_.first($scope.servicerequests));
        }
        $scope.total = response.total;
        $scope.spin = false;
      }).catch(function (error) {
        $scope.spin = false;
      });
    };


    //check whether servicerequests will paginate
    $scope.willPaginate = function () {
      var willPaginate =
        ($scope.servicerequests && $scope.total && $scope.total > $scope.limit);
      return willPaginate;
    };

    //export current filtered issues
    $scope.export = function () {
      var _exports =
        _.map($scope.servicerequests, function (servicerequest) {
          return {
            code: servicerequest.code,
            reportedAt: servicerequest.createdAt,
            callStart: (servicerequest.call || {}).startedAt,
            callEnd: (servicerequest.call || {}).endedAt,
            callDurationMinutes: ((servicerequest.call || {}).duration ||
                {})
              .minutes,
            callDurationSeconds: ((servicerequest.call || {}).duration ||
                {})
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
            ttrSeconds: (servicerequest.ttr || {}).seconds
          };
        });
      return _exports;
    };


    //pre load un resolved servicerequests on state activation
    $scope.find({ resolvedAt: null, operator: { $ne: null } });

    //listen for events
    $rootScope.$on('app:servicerequests:reload', function () {
      $scope.find({ resolvedAt: null, operator: { $ne: null } });
    });

    //reload summaries
    $rootScope.$on('app:servicerequests:reload', function () {
      Summary.issues().then(function (summaries) {
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
  .controller('ServiceRequestShowCtrl', function ($rootScope, $scope, $state,
    $stateParams, ServiceRequest, $timeout) {

    $scope.edit = false;
    $scope.roles = roles.roles;

    $scope.onEdit = function () {
      $scope.edit = true;
    };

    //load party
    $scope.party = ServiceRequest.get({
      id: $stateParams.id
    });


    /**
     * @description block created party
     */
    $scope.block = function () {
      //TODO show input prompt
      //TODO show loading mask
      $scope.party.deletedAt = new Date();
      $scope.save();
    };


    /**
     * @description unblock created party
     */
    $scope.unblock = function () {
      //TODO show input prompt
      //TODO show loading mask
      $scope.party.deletedAt = null;
      $scope.save();
    };

    /**
     * @description save created party
     */
    $scope.save = function () {
      //TODO show input prompt
      //TODO show loading mask
      $scope.party.roles = $scope.party._assigned;

      $scope.party.$update().then(function (response) {

          response = response || {};

          response.message =
            response.message || 'User updated successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('servicerequest:update:success', response);
          $rootScope.$broadcast('app:servicerequests:reload');

          $state.go('app.servicerequests.list');
        })
        .catch(function (error) {
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
angular
  .module('ng311')
  .config(function ($stateProvider) {

    //servicerequests management states
    $stateProvider
      .state('app.servicerequests', {
        // abstract: true,
        templateUrl: 'views/servicerequests/main.html',
        controller: 'ServiceRequestMainCtrl',
        resolve: {
          endpoints: function (Summary) {
            return Summary.endpoints({
              query: {
                deletedAt: {
                  $eq: null
                }
              }
            });
          }
        }
      })
      .state('app.servicerequests.list', {
        url: '/servicerequests',
        templateUrl: 'views/servicerequests/index.html',
        controller: 'ServiceRequestIndexCtrl',
        data: {
          authenticated: true
        }
      })
      .state('app.servicerequests.show', {
        url: '/servicerequests/show/:id',
        templateUrl: 'views/servicerequests/create.html',
        controller: 'ServiceRequestShowCtrl',
        data: {
          authenticated: true
        }
      })
      .state('app.create_servicerequests', {
        url: '/servicerequests/create',
        params: { //hack to allow state go with reporter $state param
          reporter: undefined,
          jurisdiction: undefined,
          servicerequest: undefined
        },
        templateUrl: 'views/servicerequests/create.html',
        controller: 'ServiceRequestCreateCtrl',
        data: {
          authenticated: true
        },
        resolve: {
          endpoints: function (Summary) {
            return Summary.endpoints({
              query: {
                deletedAt: {
                  $eq: null
                }
              }
            });
          }
        }
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
  .factory('ServiceGroup', function ($http, $resource, Utils) {

    //create servicegroup resource
    var ServiceGroup = $resource(Utils.asLink(['servicegroups', ':id']), {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
    });


    /**
     * @description find servicegroup with pagination
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    ServiceGroup.find = function (params) {
      return $http.get(Utils.asLink('servicegroups'), {
          params: params
        })
        .then(function (response) {

          //map plain servicegroup object to resource instances
          var servicegroups =
            response.data.servicegroups.map(function (servicegroup) {
              //create servicegroup as a resource instance
              return new ServiceGroup(servicegroup);
            });

          //return paginated response
          return {
            servicegroups: servicegroups,
            total: response.data.count
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
  .controller('ServiceGroupIndexCtrl', function (
    $rootScope, $scope, $state, ServiceGroup
  ) {

    //groups in the scope
    $scope.spin = false;
    $scope.servicegroups = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function () {
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
    $scope.select = function (servicegroup) {

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
    $scope.find = function () {
      //start sho spinner
      $scope.spin = true;

      ServiceGroup.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1
        },
        query: {},
        q: $scope.q
      }).then(function (response) {
        //update scope with groups when done loading
        $scope.servicegroups = response.servicegroups;
        if ($scope.updated) {
          $scope.updated = false;
        } else {
          $scope.select(_.first($scope.servicegroups));
        }
        $scope.total = response.total;
        $scope.spin = false;
      }).catch(function (error) {
        $scope.spin = false;
      });
    };


    //check whether groups will paginate
    $scope.willPaginate = function () {
      var willPaginate =
        ($scope.servicegroups && $scope.total && $scope.total > $scope.limit);
      return willPaginate;
    };


    //pre load groups on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:servicegroups:reload', function () {
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
  .controller('ServiceGroupShowCtrl', function (
    $rootScope, $scope, $state, $stateParams, ServiceGroup
  ) {

    $scope.edit = false;

    $scope.onEdit = function () {
      $scope.edit = true;
    };

    $scope.onCancel = function () {
      $scope.edit = false;
      $rootScope.$broadcast('app:servicegroups:reload');
    };

    $scope.onNew = function () {
      $scope.servicegroup = new ServiceGroup({});
      $scope.edit = true;
    };

    //TODO show empty state if no servicegroup selected
    //listen for selected servicegroup
    $rootScope.$on('servicegroup:selected', function (event, servicegroup) {
      $scope.servicegroup = servicegroup;
    });

    /**
     * @description save created servicegroup
     */
    $scope.save = function () {
      //TODO show input prompt
      //TODO show loading mask

      //try update or save servicegroup
      var updateOrSave =
        (!$scope.servicegroup._id ?
          $scope.servicegroup.$save() : $scope.servicegroup.$update());

      updateOrSave.then(function (response) {

          response = response || {};

          response.message =
            response.message || 'Service Group Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:servicegroups:reload');

          $scope.edit = false;

        })
        .catch(function (error) {
          $rootScope.$broadcast('appError', error);
        });
    };

  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:ServiceGroup
 * @description
 * ServiceGroup states configuration of ng311 
 */
angular
  .module('ng311')
  .config(function ($stateProvider) {

    //servicegroups management states
    $stateProvider
      .state('app.manage.servicegroups', {
        url: '/servicegroups',
        views: {
          list: {
            templateUrl: 'views/servicegroups/_partials/list.html',
            controller: 'ServiceGroupIndexCtrl'
          },
          detail: {
            templateUrl: 'views/servicegroups/_partials/detail.html',
            controller: 'ServiceGroupShowCtrl'
          }
        },
        data: {
          authenticated: true
        }
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
angular
  .module('ng311')
  .factory('Service', function ($http, $resource, Utils) {

    //create service resource
    var Service = $resource(Utils.asLink(['services', ':id']), {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
    });


    /**
     * @description find service with pagination
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Service.find = function (params) {
      return $http.get(Utils.asLink('services'), {
          params: params
        })
        .then(function (response) {

          //map plain service object to resource instances
          var services = response.data.services.map(function (service) {
            //create service as a resource instance
            return new Service(service);
          });

          //return paginated response
          return {
            services: services,
            total: response.data.count
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
  .controller('ServiceIndexCtrl', function (
    $rootScope, $scope, $state, Service
  ) {

    //services in the scope
    $scope.spin = false;
    $scope.services = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function () {
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
    $scope.select = function (service) {

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
    $scope.find = function () {
      //start sho spinner
      $scope.spin = true;

      Service.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1
        },
        query: {},
        q: $scope.q
      }).then(function (response) {
        //update scope with services when done loading
        $scope.services = response.services;
        if ($scope.updated) {
          $scope.updated = false;
        } else {
          $scope.select(_.first($scope.services));
        }
        $scope.total = response.total;
        $scope.spin = false;
      }).catch(function (error) {
        $scope.spin = false;
      });
    };


    //check whether services will paginate
    $scope.willPaginate = function () {
      var willPaginate =
        ($scope.services && $scope.total && $scope.total > $scope.limit);
      return willPaginate;
    };


    //pre load services on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:services:reload', function () {
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
  .controller('ServiceShowCtrl', function (
    $rootScope, $scope, $state, $stateParams, Service,
    jurisdictions, servicegroups
  ) {

    $scope.edit = false;
    $scope.jurisdictions = jurisdictions.jurisdictions;
    $scope.servicegroups = servicegroups.servicegroups;

    $scope.onEdit = function () {
      $scope.edit = true;
    };

    $scope.onCancel = function () {
      $scope.edit = false;
      $rootScope.$broadcast('app:services:reload');
    };

    $scope.onNew = function () {
      $scope.service = new Service({});
      $scope.edit = true;
    };

    //TODO show empty state if no service selected
    //listen for selected service
    $rootScope.$on('service:selected', function (event, service) {
      $scope.service = service;
    });

    /**
     * @description save created service
     */
    $scope.save = function () {
      //TODO show input prompt
      //TODO show loading mask

      //try update or save service
      var updateOrSave =
        (!$scope.service._id ?
          $scope.service.$save() : $scope.service.$update());

      updateOrSave.then(function (response) {

          response = response || {};

          response.message =
            response.message || 'Service Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:services:reload');

          $scope.edit = false;

        })
        .catch(function (error) {
          $rootScope.$broadcast('appError', error);
        });
    };

  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Service
 * @description
 * Service states configuration of ng311 
 */
angular
  .module('ng311')
  .config(function ($stateProvider) {

    //services management states
    $stateProvider
      .state('app.manage.services', {
        url: '/services',
        views: {
          list: {
            templateUrl: 'views/services/_partials/list.html',
            controller: 'ServiceIndexCtrl'
          },
          detail: {
            templateUrl: 'views/services/_partials/detail.html',
            controller: 'ServiceShowCtrl',
            resolve: {
              jurisdictions: function (Jurisdiction) {
                return Jurisdiction.find({
                  query: {
                    deletedAt: {
                      $eq: null
                    }
                  }
                });
              },
              servicegroups: function (ServiceGroup) {
                return ServiceGroup.find({
                  query: {
                    deletedAt: {
                      $eq: null
                    }
                  }
                });
              }
            }
          }
        },
        data: {
          authenticated: true
        }
      });
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
  .controller('StatusIndexCtrl', function (
    $rootScope, $scope, $state, Status
  ) {

    //statuses in the scope
    $scope.spin = false;
    $scope.statuses = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function () {
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
    $scope.select = function (status) {

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
    $scope.find = function () {
      //start sho spinner
      $scope.spin = true;

      Status.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1
        },
        query: {},
        q: $scope.q
      }).then(function (response) {
        //update scope with statuses when done loading
        $scope.statuses = response.statuses;
        if ($scope.updated) {
          $scope.updated = false;
        } else {
          $scope.select(_.first($scope.statuses));
        }
        $scope.total = response.total;
        $scope.spin = false;
      }).catch(function (error) {
        $scope.spin = false;
      });
    };


    //check whether statuses will paginate
    $scope.willPaginate = function () {
      var willPaginate =
        ($scope.statuses && $scope.total && $scope.total > $scope.limit);
      return willPaginate;
    };


    //pre load statuses on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:statuses:reload', function () {
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
  .controller('StatusShowCtrl', function (
    $rootScope, $scope, $state, $stateParams, Status
  ) {

    $scope.edit = false;

    $scope.onEdit = function () {
      $scope.edit = true;
    };

    $scope.onCancel = function () {
      $scope.edit = false;
      $rootScope.$broadcast('app:statuses:reload');
    };

    $scope.onNew = function () {
      $scope.status = new Status({ weight: 0, color: '#FF9800' });
      $scope.edit = true;
    };

    //TODO show empty state if no status selected
    //listen for selected juridiction
    $rootScope.$on('status:selected', function (event, status) {
      $scope.status = status;
    });

    /**
     * @description save created status
     */
    $scope.save = function () {
      //TODO show input prompt
      //TODO show loading mask

      //try update or save status
      var updateOrSave =
        (!$scope.status._id ? $scope.status.$save() : $scope.status.$update());

      updateOrSave.then(function (response) {

          response = response || {};

          response.message =
            response.message || 'Status Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:statuses:reload');

          $scope.edit = false;

        })
        .catch(function (error) {
          $rootScope.$broadcast('appError', error);
        });
    };

  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Status
 * @description
 * Status states configuration of ng311 
 */
angular
  .module('ng311')
  .config(function ($stateProvider) {

    //statuses management states
    $stateProvider
      .state('app.manage.statuses', {
        url: '/statuses',
        views: {
          list: {
            templateUrl: 'views/statuses/_partials/list.html',
            controller: 'StatusIndexCtrl'
          },
          detail: {
            templateUrl: 'views/statuses/_partials/detail.html',
            controller: 'StatusShowCtrl'
          }
        },
        data: {
          authenticated: true
        }
      });
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
  .controller('PriorityIndexCtrl', function (
    $rootScope, $scope, $state, Priority
  ) {

    //priorities in the scope
    $scope.spin = false;
    $scope.priorities = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function () {
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
    $scope.select = function (priority) {

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
    $scope.find = function () {
      //start sho spinner
      $scope.spin = true;

      Priority.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1
        },
        query: {},
        q: $scope.q
      }).then(function (response) {
        //update scope with priorities when done loading
        $scope.priorities = response.priorities;
        if ($scope.updated) {
          $scope.updated = false;
        } else {
          $scope.select(_.first($scope.priorities));
        }
        $scope.total = response.total;
        $scope.spin = false;
      }).catch(function (error) {
        $scope.spin = false;
      });
    };


    //check whether priorities will paginate
    $scope.willPaginate = function () {
      var willPaginate =
        ($scope.priorities && $scope.total && $scope.total > $scope.limit);
      return willPaginate;
    };


    //pre load priorities on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:priorities:reload', function () {
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
  .controller('PriorityShowCtrl', function (
    $rootScope, $scope, $state, $stateParams, Priority
  ) {

    $scope.edit = false;

    $scope.onEdit = function () {
      $scope.edit = true;
    };

    $scope.onCancel = function () {
      $scope.edit = false;
      $rootScope.$broadcast('app:priorities:reload');
    };

    $scope.onNew = function () {
      $scope.priority = new Priority({ weight: 0, color: '#FF9800' });
      $scope.edit = true;
    };

    //TODO show empty state if no priority selected
    //listen for selected juridiction
    $rootScope.$on('priority:selected', function (event, priority) {
      $scope.priority = priority;
    });

    /**
     * @description save created priority
     */
    $scope.save = function () {
      //TODO show input prompt
      //TODO show loading mask

      //try update or save priority
      var updateOrSave =
        (!$scope.priority._id ?
          $scope.priority.$save() : $scope.priority.$update());

      updateOrSave.then(function (response) {

          response = response || {};

          response.message =
            response.message || 'Priority Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:priorities:reload');

          $scope.edit = false;

        })
        .catch(function (error) {
          $rootScope.$broadcast('appError', error);
        });
    };

  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Priority
 * @description
 * Priority states configuration of ng311 
 */
angular
  .module('ng311')
  .config(function ($stateProvider) {

    //priorities management states
    $stateProvider
      .state('app.manage.priorities', {
        url: '/priorities',
        views: {
          list: {
            templateUrl: 'views/priorities/_partials/list.html',
            controller: 'PriorityIndexCtrl'
          },
          detail: {
            templateUrl: 'views/priorities/_partials/detail.html',
            controller: 'PriorityShowCtrl'
          }
        },
        data: {
          authenticated: true
        }
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
  .factory('Jurisdiction', function ($http, $resource, Utils) {

    //create jurisdiction resource
    var Jurisdiction = $resource(Utils.asLink(['jurisdictions', ':id']), {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
    });


    /**
     * @description find jurisdiction with pagination
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Jurisdiction.find = function (params) {
      return $http.get(Utils.asLink('jurisdictions'), {
          params: params
        })
        .then(function (response) {

          //map plain jurisdiction object to resource instances
          var jurisdictions =
            response.data.jurisdictions.map(function (jurisdiction) {
              //create jurisdiction as a resource instance
              return new Jurisdiction(jurisdiction);
            });

          //return paginated response
          return {
            jurisdictions: jurisdictions,
            total: response.data.count
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
  .controller('JurisdictionIndexCtrl', function (
    $rootScope, $scope, $state, Jurisdiction
  ) {

    //jurisdictions in the scope
    $scope.spin = false;
    $scope.jurisdictions = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function () {
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
    $scope.select = function (jurisdiction) {

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
    $scope.find = function () {
      //start sho spinner
      $scope.spin = true;

      Jurisdiction.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1
        },
        query: {},
        q: $scope.q
      }).then(function (response) {
        //update scope with jurisdictions when done loading
        $scope.jurisdictions = response.jurisdictions;
        if ($scope.updated) {
          $scope.updated = false;
        } else {
          $scope.select(_.first($scope.jurisdictions));
        }
        $scope.total = response.total;
        $scope.spin = false;
      }).catch(function (error) {
        $scope.spin = false;
      });
    };


    //check whether jurisdictions will paginate
    $scope.willPaginate = function () {
      var willPaginate =
        ($scope.jurisdictions && $scope.total && $scope.total > $scope.limit);
      return willPaginate;
    };


    //pre load jurisdictions on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:jurisdictions:reload', function () {
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
  .controller('JurisdictionShowCtrl', function (
    $rootScope, $scope, $state, $stateParams, Jurisdiction
  ) {

    $scope.edit = false;

    $scope.onEdit = function () {
      $scope.edit = true;
    };

    $scope.onCancel = function () {
      $scope.edit = false;
      $rootScope.$broadcast('app:jurisdictions:reload');
    };

    $scope.onNew = function () {
      $scope.jurisdiction = new Jurisdiction({
        location: {
          coordinates: [0, 0]
        }
      });
      $scope.edit = true;
    };

    //TODO show empty state if no jurisdiction selected
    //listen for selected jurisdiction
    $rootScope.$on('jurisdiction:selected', function (event, jurisdiction) {
      $scope.jurisdiction = jurisdiction;
    });

    /**
     * @description save created jurisdiction
     */
    $scope.save = function () {
      //TODO show input prompt
      //TODO show loading mask

      //update location(longitude & latitude) coordinates
      $scope.jurisdiction.location.coordinates[0] =
        $scope.jurisdiction.longitude;
      $scope.jurisdiction.location.coordinates[1] =
        $scope.jurisdiction.latitude;

      //try update or save jurisdiction
      var updateOrSave =
        (!$scope.jurisdiction._id ?
          $scope.jurisdiction.$save() : $scope.jurisdiction.$update());

      updateOrSave.then(function (response) {

          response = response || {};

          response.message =
            response.message || 'Jurisdiction Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:jurisdictions:reload');

          $scope.edit = false;

        })
        .catch(function (error) {
          $rootScope.$broadcast('appError', error);
        });
    };

  });

'use strict';

/**
 * @ngdoc function
 * @name ng311.states:Jurisdiction
 * @description
 * Jurisdiction states configuration of ng311 
 */
angular
  .module('ng311')
  .config(function ($stateProvider) {

    //jurisdictions management states
    $stateProvider
      .state('app.manage.jurisdictions', {
        url: '/jurisdictions',
        views: {
          list: {
            templateUrl: 'views/jurisdictions/_partials/list.html',
            controller: 'JurisdictionIndexCtrl'
          },
          detail: {
            templateUrl: 'views/jurisdictions/_partials/detail.html',
            controller: 'JurisdictionShowCtrl'
          }
        },
        data: {
          authenticated: true
        }
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
angular
  .module('ng311')
  .factory('Role', function ($http, $resource, Utils) {

    //create role resource
    var Role = $resource(Utils.asLink(['roles', ':id']), {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
    });


    /**
     * @description find roles with pagination
     * @param  {Object} params [description]
     */
    Role.find = function (params) {
      return $http.get(Utils.asLink('roles'), {
          params: params
        })
        .then(function (response) {

          //map plain role object to resource instances
          var roles = response.data.roles.map(function (role) {
            //create role as a resource instance
            return new Role(role);
          });

          //return paginated response
          return {
            roles: roles,
            total: response.data.count
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
  .controller('RoleIndexCtrl', function (
    $rootScope, $scope, $state, Role
  ) {

    //roles in the scope
    $scope.spin = false;
    $scope.roles = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function () {
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
    $scope.select = function (role) {

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
    $scope.find = function () {
      //start sho spinner
      $scope.spin = true;

      Role.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1
        },
        query: {},
        q: $scope.q
      }).then(function (response) {
        //update scope with roles when done loading
        $scope.roles = response.roles;
        if ($scope.updated) {
          $scope.updated = false;
        } else {
          $scope.select(_.first($scope.roles));
        }
        $scope.total = response.total;
        $scope.spin = false;
      }).catch(function (error) {
        $scope.spin = false;
      });
    };


    //check whether roles will paginate
    $scope.willPaginate = function () {
      var willPaginate =
        ($scope.roles && $scope.total && $scope.total > $scope.limit);
      return willPaginate;
    };


    //pre load roles on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:roles:reload', function () {
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
  .controller('RoleShowCtrl', function (
    $rootScope, $scope, $state, $stateParams, Role, permissions
  ) {

    $scope.permissions = permissions.permissions;

    //prepare grouped permissions
    $scope.grouped = _.groupBy($scope.permissions, 'resource');
    $scope.grouped = _.map($scope.grouped, function (values, key) {
      return { resource: key, permits: values };
    });

    $scope.edit = false;

    $scope.onEdit = function () {
      $scope.edit = true;
    };

    $scope.onCancel = function () {
      $scope.edit = false;
      $rootScope.$broadcast('app:roles:reload');
    };

    $scope.onNew = function () {
      $scope.role = new Role({
        permissions: []
      });
      $scope.edit = true;
    };

    /**
     * @description block created role
     */
    $scope.block = function () {
      //TODO show input prompt
      //TODO show loading mask
      $scope.role.deletedAt = new Date();
      $scope.save();
    };


    /**
     * @description unblock created role
     */
    $scope.unblock = function () {
      //TODO show input prompt
      //TODO show loading mask
      $scope.role.deletedAt = null;
      $scope.save();
    };

    //TODO show empty state if no role selected
    //listen for selected juridiction
    $rootScope.$on('role:selected', function (event, role) {
      $scope.role = role;
    });

    /**
     * @description save created role
     */
    $scope.save = function () {
      //TODO show input prompt
      //TODO show loading mask

      //update assigned permissions
      $scope.role.permissions = $scope.role._assigned;

      //try update or save role
      var updateOrSave =
        (!$scope.role._id ? $scope.role.$save() : $scope.role.$update());

      updateOrSave.then(function (response) {

          response = response || {};

          response.message =
            response.message || 'Role Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:roles:reload');

          $scope.edit = false;

        })
        .catch(function (error) {
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
angular
  .module('ng311')
  .config(function ($stateProvider) {

    //role management states
    $stateProvider
      .state('app.manage.roles', {
        url: '/roles',
        views: {
          list: {
            templateUrl: 'views/roles/_partials/list.html',
            controller: 'RoleIndexCtrl'
          },
          detail: {
            templateUrl: 'views/roles/_partials/detail.html',
            controller: 'RoleShowCtrl',
            resolve: {
              permissions: function (Permission) {
                return Permission.find();
              }
            }
          }
        },
        data: {
          authenticated: true
        }
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
angular
  .module('ng311')
  .factory('Party', function ($http, $resource, Utils) {

    //create party resource
    var Party = $resource(Utils.asLink(['parties', ':id']), {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
    });


    /**
     * @description find party with pagination
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Party.find = function (params) {
      return $http.get(Utils.asLink('parties'), {
          params: params
        })
        .then(function (response) {

          //map plain party object to resource instances
          var parties = response.data.parties.map(function (party) {
            //create party as a resource instance
            return new Party(party);
          });

          //return paginated response
          return {
            parties: parties,
            total: response.data.count
          };
        });
    };


    /**
     * @description request party password recover from backend
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Party.requestRecover = function (params) {
      return $http.put(Utils.asLink('forgot'), params)
        .then(function (response) {
          return response.data;
        });
    };


    /**
     * @description send party password recovery to backend
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Party.recover = function (params) {
      return $http.put(Utils.asLink('recover'), params)
        .then(function (response) {
          return response.data;
        });
    };


    /**
     * @description confirm party account
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Party.confirm = function (params) {
      return $http.put(Utils.asLink('confirm'), params)
        .then(function (response) {
          return response.data;
        });
    };


    /**
     * @description change party password
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Party.change = function (params) {
      return $http.put(Utils.asLink('change'), params)
        .then(function (response) {
          return response.data;
        });
    };


    /**
     * @description unlock given locked party account
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    Party.unlock = function (params) {
      return $http.put(Utils.asLink('unlock'), params)
        .then(function (response) {
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
  .controller('PartyIndexCtrl', function (
    $rootScope, $scope, $state, Party
  ) {

    //parties in the scope
    $scope.spin = false;
    $scope.parties = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.total = 0;

    $scope.search = {};

    $scope.onSearch = function () {
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
    $scope.select = function (party) {

      //sort comments in desc order
      if (party && party._id) {

        //prepare displayable roles
        party._roles = party.roles && !_.isEmpty(party.roles) ?
          _.join(_.map(party.roles, 'name'), ', ') :
          'N/A';

        //deduce assigned roles
        party._assigned = _.map(party.roles, '_id');

        //update scope service request ref
        $scope.party = party;
        $rootScope.$broadcast('party:selected', party);
      }


      $scope.create = false;

    };


    /**
     * @description load parties
     */
    $scope.find = function () {
      //start sho spinner
      $scope.spin = true;

      Party.find({
        page: $scope.page,
        limit: $scope.limit,
        sort: {
          name: 1
        },
        query: {},
        q: $scope.q
      }).then(function (response) {
        //update scope with parties when done loading
        $scope.parties = response.parties;
        if ($scope.updated) {
          $scope.updated = false;
        } else {
          $scope.select(_.first($scope.parties));
        }
        $scope.total = response.total;
        $scope.spin = false;
      }).catch(function (error) {
        $scope.spin = false;
      });
    };


    //check whether parties will paginate
    $scope.willPaginate = function () {
      var willPaginate =
        ($scope.parties && $scope.total && $scope.total > $scope.limit);
      return willPaginate;
    };


    //pre load parties on state activation
    $scope.find();

    //listen for events
    $rootScope.$on('app:parties:reload', function () {
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
  .controller('PartyShowCtrl', function (
    $rootScope, $scope, $state, $stateParams, Party,
    jurisdictions, roles
  ) {

    $scope.edit = false;
    $scope.jurisdictions = jurisdictions.jurisdictions;
    $scope.roles = roles.roles;

    $scope.onEdit = function () {
      $scope.edit = true;
    };

    $scope.onCancel = function () {
      $scope.edit = false;
      $rootScope.$broadcast('app:parties:reload');
    };

    $scope.onNew = function () {
      $scope.party = new Party({
        roles: [],
        _assigned: []
      });
      $scope.edit = true;
    };

    /**
     * @description block created party
     */
    $scope.block = function () {
      //TODO show input prompt
      //TODO show loading mask
      $scope.party.deletedAt = new Date();
      $scope.save();
    };


    /**
     * @description unblock created party
     */
    $scope.unblock = function () {
      //TODO show input prompt
      //TODO show loading mask
      $scope.party.deletedAt = null;
      $scope.save();
    };

    //TODO show empty state if no party selected
    //listen for selected juridiction
    $rootScope.$on('party:selected', function (event, party) {
      $scope.party = party;
    });

    /**
     * @description save created party
     */
    $scope.save = function () {
      //TODO show input prompt
      //TODO show loading mask

      //update party assigned roles
      $scope.party.roles = $scope.party._assigned;

      //try update or save party
      var updateOrSave =
        (!$scope.party._id ? $scope.party.$save() : $scope.party.$update());

      updateOrSave.then(function (response) {

          response = response || {};

          response.message =
            response.message || 'Party Saved Successfully';

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('app:parties:reload');

          $scope.edit = false;

        })
        .catch(function (error) {
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
angular
  .module('ng311')
  .config(function ($stateProvider) {

    //parties management states
    $stateProvider
      .state('app.manage.parties', {
        url: '/parties',
        views: {
          list: {
            templateUrl: 'views/parties/_partials/list.html',
            controller: 'PartyIndexCtrl'
          },
          detail: {
            templateUrl: 'views/parties/_partials/detail.html',
            controller: 'PartyShowCtrl',
            resolve: {
              jurisdictions: function (Jurisdiction) {
                return Jurisdiction.find({
                  query: {
                    deletedAt: {
                      $eq: null
                    }
                  }
                });
              }
            }
          }
        },
        data: {
          authenticated: true
        },
        resolve: {
          roles: function (Role) {
            return Role.find({
              query: {
                deletedAt: {
                  $eq: null
                }
              }
            });
          }
        }
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
angular
  .module('ng311')
  .factory('Summary', function ($http, $resource, Utils) {
    var Summary = {};

    /**
     * @description find roles with pagination
     * @param  {Object} params [description]
     */
    Summary.issues = function (params) {
      return $http.get(Utils.asLink('summaries'), {
          params: params
        })
        .then(function (response) {
          return response.data;
        });
    };


    /**
     * @description load all api endpoint in singe request to improve
     *              ui responsiveness
     * @param  {Object} params additional params
     * @return {Object}        
     */
    Summary.endpoints = function (params) {
      return $http.get(Utils.asLink('endpoints'), {
          params: params
        })
        .then(function (response) {
          return response.data;
        });
    };

    /**
     * @description load current overview/pipeline
     * @param  {Object} params additional params
     * @return {Object}        
     */
    Summary.overviews = function (params) {
      return $http.get(Utils.asLink('overviews'), {
          params: params
        })
        .then(function (response) {
          return response.data;
        });
    };

    /**
     * @description load current standings
     * @param  {Object} params additional params
     * @return {Object}        
     */
    Summary.standings = function (params) {
      return $http.get(Utils.asLink(['reports', 'standings']), {
          params: params
        })
        .then(function (response) {
          return response.data;
        });
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
angular
  .module('ng311')
  .factory('Setting', function ($http, $resource, Utils) {

    //create setting resource
    var Setting = $resource(Utils.asLink(['settings', ':id']), {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
    });


    /**
     * @description find settings with pagination
     * @param  {Object} params [description]
     */
    Setting.find = function (params) {
      return $http.get(Utils.asLink('settings'), {
          params: params
        })
        .then(function (response) {

          //map plain setting object to resource instances
          var settings = response.data.settings.map(function (setting) {
            //create setting as a resource instance
            return new Setting(setting);
          });

          //return paginated response
          return {
            settings: settings,
            total: response.data.count
          };
        });
    };

    /**
     * @description bulk update applications settings
     * @param  {Object} data [description]
     */
    Setting.bulkUpdate = function (data) {

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
  .controller('SettingIndexCtrl', function (
    $rootScope, $scope, $state, ENV, Setting
  ) {

    //signal if its editing process
    $scope.edit = false;

    //use only editable properties
    $scope.settings = $rootScope.party.settings || {};


    $scope.onEdit = function () {
      $scope.edit = true;
    };


    $scope.onClose = function () {
      $scope.edit = false;
    };


    /**
     * @description save edited customer
     */
    $scope.save = function () {
      //check if password edited
      var passwordChanged = !!$scope.party.password;

      //TODO show input prompt
      //TODO show loading mask
      Setting.bulkUpdate([$scope.settings])
        .then(function (response) {
          response = response || {};

          //update settings
          var data = response.data || {};
          $rootScope.settings = angular.merge({}, ENV.settings, data);

          response.message =
            response.message ||
            'Application settings updated successfully';

          $scope.edit = false;

          $rootScope.$broadcast('appSuccess', response);

          $rootScope.$broadcast('setting:update:success');

          $state.go('app.settings');
        })
        .catch(function (error) {
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
angular
  .module('ng311')
  .config(function ($stateProvider) {

    //setting management states
    $stateProvider
      .state('app.manage.settings', {
        url: '/settings',
        templateUrl: 'views/settings/index.html',
        controller: 'SettingIndexCtrl',
        data: {
          authenticated: true
        }
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
  .controller('DashboardOverviewCtrl', function (
    $rootScope, $scope, $state, Summary, overviews
  ) {

    /**
     * prepare multi series data
     * @param {[Object]} data series value to prepare
     * @return {[[Object]]} valid multi series data 
     */
    $scope.prepareMultiSeries = function (values) {

      values = _.map(values, function (value) {
        return {
          name: value.name,
          type: 'bar',
          datapoints: [{
            x: value.name,
            y: value.value
          }]
        };
      });

      return values;

    };

    //initialize overview
    $scope.overviews = overviews;

    $scope.prepare = function () {
      //obtain issues summary
      $scope.issues = overviews.issues;

      //TODO add date filter default to today

      $scope.prepareIssueByJurisdiction();

      $scope.prepareIssueByService();

      $scope.prepareIssueByServiceGroup();

      $scope.prepareIssueByStatus();

      $scope.prepareIssueByPriority();

    };


    $scope.prepareIssueByStatus = function () {

      var statuses = _.map($scope.overviews.statuses, 'status');

      $scope.statusConfig = {
        textStyle: {
          fontFamily: 'Lato'
        },
        radius: '55%',
        center: ['50%', '60%'],
        height: 300,
        width: 500,
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          x: 'left',
          data: statuses
        },
        calculable: true,
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Status-' + new Date().getTime(),
              title: 'Save',
              show: true
            }
          }
        }
      };

      $scope.statusData = [{
        datapoints: _.map($scope.overviews.statuses, function (status) {
          return { x: status.status, y: status.count };
        })
      }];

    };


    $scope.prepareIssueByPriority = function () {

      var priorities = _.map($scope.overviews.priorities, 'priority');

      $scope.priorityConfig = {
        textStyle: {
          fontFamily: 'Lato'
        },
        radius: '55%',
        center: ['50%', '60%'],
        height: 300,
        width: 500,
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          x: 'left',
          data: priorities
        },
        calculable: true,
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Priority-' + new Date().getTime(),
              title: 'Save',
              show: true
            }
          }
        }
      };

      $scope.priorityData = [{
        datapoints: _.map($scope.overviews.priorities, function (
          priority) {
          return { x: priority.priority, y: priority.count };
        })
      }];

    };


    $scope.prepareIssueByService = function () {

      //prepare values for bar chart
      var services = _.map(
        $scope.overviews.services,
        function (service) {
          return {
            name: service.service,
            value: service.count,
            itemStyle: {
              normal: {
                color: service.color
              }
            }
          };
        });

      $scope.serviceConfig = {
        height: 1000,
        width: 960
      };

      $scope.serviceOptions = {
        textStyle: {
          fontFamily: 'Lato'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}'
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Service-' + new Date().getTime(),
              title: 'Save',
              show: true
            }
          }
        },
        grid: {
          left: '3%',
          containLabel: true
        },
        yAxis: [{
          type: 'category',
          data: _.map(services, 'name'),
          axisTick: {
            alignWithLabel: true
          }
        }],
        xAxis: [{
          type: 'value'
        }],
        series: [{
          type: 'bar',
          barWidth: '60%',
          label: {
            normal: {
              show: true
            }
          },
          markPoint: { // show area with maximum and minimum
            data: [
              { name: 'Maximum', type: 'max' },
              { name: 'Minimum', type: 'min' }
            ]
          },
          markLine: { //add average line
            precision: 0,
            data: [
              { type: 'average', name: 'Average' }
            ]
          },
          data: services
        }]
      };

    };


    $scope.prepareIssueByServiceGroup = function () {

      var groups = _.map($scope.overviews.groups, 'group');

      $scope.groupConfig = {
        textStyle: {
          fontFamily: 'Lato'
        },
        radius: '70%',
        center: ['50%', '50%'],
        height: 300,
        width: 960,
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: groups
        },
        calculable: true,
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Service Group-' + new Date().getTime(),
              title: 'Save',
              show: true
            }
          }
        }
      };

      $scope.groupData = [{
        datapoints: _.map($scope.overviews.groups, function (
          group) {
          return { x: group.group, y: group.count };
        })
      }];

    };


    $scope.prepareIssueByJurisdiction = function () {

      //prepare values for bar chart
      var jurisdictions = _.map(
        $scope.overviews.jurisdictions,
        function (jurisdiction) {
          return {
            name: jurisdiction.jurisdiction,
            value: jurisdiction.count,
            itemStyle: {
              normal: {
                color: jurisdiction.color
              }
            }
          };
        });

      $scope.jurisdictionConfig = {
        height: 360,
        width: 960
      };

      $scope.jurisdictionOptions = {
        textStyle: {
          fontFamily: 'Lato'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}'
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Area-' + new Date().getTime(),
              title: 'Save',
              show: true
            }
          }
        },
        xAxis: [{
          type: 'category',
          data: _.map(jurisdictions, 'name'),
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          type: 'value'
        }],
        series: [{
          type: 'bar',
          barWidth: '70%',
          label: {
            normal: {
              show: true
            }
          },
          markPoint: { // show area with maximum and minimum
            data: [
              { name: 'Maximum', type: 'max' },
              { name: 'Minimum', type: 'min' }
            ]
          },
          markLine: { //add average line
            precision: 0,
            data: [
              { type: 'average', name: 'Average' }
            ]
          },
          data: jurisdictions
        }]
      };

    };


    //listen for events and reload overview accordingly
    $rootScope.$on('app:servicerequests:reload', function () {
      Summary.overviews().then(function (overviews) {
        $scope.overviews = overviews;
        $scope.prepare();
      });
    });


    //on load
    //prepare overview details
    $scope.prepare();


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
  .controller('DashboardStandingCtrl', function (
    $rootScope, $scope, $state, Summary, standings
  ) {

    //initialize standings
    $scope.standings = standings;

    $scope.prepare = function () {

      //TODO add date filter default to today

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
    $scope.prepareIssuePerJurisdiction = function () {

      //prepare unique jurisdictions for bar chart categories
      var categories = _.chain($scope.standings)
        .map('jurisdiction')
        .uniqBy('name')
        .value();

      //prepare unique jurisdiction color for bar chart and legends color
      var colors = _.map(categories, 'color');

      //prepare unique jurisdiction name for bar chart legends label
      var legends = _.map(categories, 'name');

      //prepare bar chart series data
      var data =
        _.map(categories, function (category) {

          //obtain all standings of specified jurisdiction(category)
          var value =
            _.filter($scope.standings, function (standing) {
              return standing.jurisdiction.name === category.name;
            });
          value = value ? _.sumBy(value, 'count') : 0;
          var serie = {
            name: category.name,
            value: value,
            itemStyle: {
              normal: {
                color: category.color
              }
            }
          };

          return serie;

        });

      //prepare chart config
      $scope.perJurisdictionConfig = {
        height: 400,
        width: 1200
      };

      //prepare chart options
      $scope.perJurisdictionOptions = {
        color: colors,
        textStyle: {
          fontFamily: 'Lato'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}'
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Area-' + new Date().getTime(),
              title: 'Save',
              show: true
            }
          }
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          data: _.map(categories, 'name'),
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          type: 'value'
        }],
        series: [{
          type: 'bar',
          barWidth: '70%',
          label: {
            normal: {
              show: true
            }
          },
          markPoint: { // show area with maximum and minimum
            data: [
              { name: 'Maximum', type: 'max' },
              { name: 'Minimum', type: 'min' }
            ]
          },
          markLine: { //add average line
            precision: 0,
            data: [
              { type: 'average', name: 'Average' }
            ]
          },
          data: data
        }]
      };

    };


    /**
     * prepare per jurisdiction per service group bar chart
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareIssuePerJurisdictionPerServiceGroup = function () {

      //prepare unique jurisdictions for bar chart categories
      var categories = _.chain($scope.standings)
        .map('jurisdiction.name')
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
      _.forEach(categories, function (category) {
        _.forEach(groups, function (group) {
          var serie = series[group.name] || {
            name: group.name,
            type: 'bar',
            label: {
              normal: {
                show: true,
              }
            },
            data: []
          };

          //obtain all standings of specified jurisdiction(category)
          //and group
          var value =
            _.filter($scope.standings, function (standing) {
              return (standing.jurisdiction.name === category &&
                standing.group.name === group.name);
            });
          value = value ? _.sumBy(value, 'count') : 0;
          serie.data.push({
            value: value,
            itemStyle: {
              normal: {
                color: group.color
              }
            }
          });
          series[group.name] = serie;
        });
      });
      series = _.values(series);

      //prepare chart config
      $scope.perJurisdictionPerServiceGroupConfig = {
        height: 400,
        width: 1200
      };

      //prepare chart options
      $scope.perJurisdictionPerServiceGroupOptions = {
        color: colors,
        textStyle: {
          fontFamily: 'Lato'
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{b} : {c}'
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: legends
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Area Per Service Group-' + new Date().getTime(),
              title: 'Save',
              show: true
            }
          }
        },
        calculable: true,
        stack: true,
        xAxis: [{
          type: 'category',
          data: categories
        }],
        yAxis: [{
          type: 'value'
        }],
        series: series
      };

    };


    /**
     * prepare per jurisdiction per service bar chart
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareIssuePerJurisdictionPerService = function () {

      //prepare unique jurisdictions for bar chart categories
      var categories = _.chain($scope.standings)
        .map('jurisdiction.name')
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
        width: 1200
      };
      //prepare chart options
      $scope.perJurisdictionPerServiceOptions = [];

      //chunk services for better charting display
      var chunks = _.chunk(services, 4);
      var chunksSize = _.size(chunks);
      _.forEach(chunks, function (_services, index) {

        //prepare unique service color for bar chart and legends color
        var colors = _.map(_services, 'color');

        //prepare unique service name for bar chart legends label
        var legends = _.map(_services, 'name');

        //prepare bar chart series
        var series = {};
        _.forEach(categories, function (category) {
          _.forEach(_services, function (service) {
            var serie = series[service.name] || {
              name: service.name,
              type: 'bar',
              label: {
                normal: {
                  show: true,
                }
              },
              data: []
            };

            //obtain all standings of specified jurisdiction(category)
            //and service
            var value =
              _.filter($scope.standings, function (standing) {
                return (standing.jurisdiction.name ===
                  category &&
                  standing.service.name === service.name);
              });
            value = value ? _.sumBy(value, 'count') : 0;
            serie.data.push({
              value: value,
              itemStyle: {
                normal: {
                  color: service.color
                }
              }
            });
            series[service.name] = serie;
          });
        });
        series = _.values(series);

        //ensure bottom margin for top charts
        var chart = (index === (chunksSize - 1)) ? {} : {
          grid: {
            bottom: '30%'
          }
        };

        //prepare chart options
        $scope.perJurisdictionPerServiceOptions.push(_.merge(chart, {
          color: colors,
          textStyle: {
            fontFamily: 'Lato'
          },
          tooltip: {
            trigger: 'item',
            // formatter: '{b} : {c}'
          },
          legend: {
            orient: 'horizontal',
            x: 'center',
            y: 'top',
            data: legends
          },
          toolbox: {
            show: true,
            feature: {
              saveAsImage: {
                name: 'Issue per Area Per Service-' + new Date().getTime(),
                title: 'Save',
                show: true
              }
            }
          },
          calculable: true,
          stack: true,
          xAxis: [{
            type: 'category',
            data: categories
          }],
          yAxis: [{
            type: 'value'
          }],
          series: series
        }));

      });

    };



    /**
     * prepare per jurisdiction per status bar chart
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareIssuePerJurisdictionPerStatus = function () {

      //prepare unique jurisdictions for bar chart categories
      var categories = _.chain($scope.standings)
        .map('jurisdiction.name')
        .uniq()
        .value();

      //prepare unique status for bar chart series
      var statuses = _.chain($scope.standings)
        .map('status')
        .uniqBy('name')
        .value();

      //prepare unique status color for bar chart and legends color
      var colors = _.map(statuses, 'color');

      //prepare unique status name for bar chart legends label
      var legends = _.map(statuses, 'name');

      //prepare bar chart series
      var series = {};
      _.forEach(categories, function (category) {
        _.forEach(statuses, function (status) {
          var serie = series[status.name] || {
            name: status.name,
            type: 'bar',
            label: {
              normal: {
                show: true,
                position: 'top'
              }
            },
            data: []
          };

          //obtain all standings of specified jurisdiction(category)
          //and status
          var value =
            _.filter($scope.standings, function (standing) {
              return (standing.jurisdiction.name ===
                category &&
                standing.status.name === status.name);
            });
          value = value ? _.sumBy(value, 'count') : 0;
          serie.data.push({
            value: value,
            itemStyle: {
              normal: {
                color: status.color
              }
            }
          });
          series[status.name] = serie;
        });
      });
      series = _.values(series);

      //prepare chart config
      $scope.perJurisdictionPerStatusConfig = {
        height: 400,
        width: 1200
      };

      //prepare chart options
      $scope.perJurisdictionPerStatusOptions = {
        color: colors,
        textStyle: {
          fontFamily: 'Lato'
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{b} : {c}'
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: legends
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Area Per Status-' + new Date().getTime(),
              title: 'Save',
              show: true
            }
          }
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          data: categories
        }],
        yAxis: [{
          type: 'value'
        }],
        series: series
      };

    };


    /**
     * prepare per jurisdiction per priority bar chart
     * @return {object} echart bar chart configurations
     * @version 0.1.0
     * @since  0.1.0
     * @author lally elias<lallyelias87@gmail.com>
     */
    $scope.prepareIssuePerJurisdictionPerPriority = function () {

      //prepare unique jurisdictions for bar chart categories
      var categories = _.chain($scope.standings)
        .map('jurisdiction.name')
        .uniq()
        .value();

      //prepare unique priority for bar chart series
      var prioroties = _.chain($scope.standings)
        .map('priority')
        .uniqBy('name')
        .value();

      //prepare unique priority color for bar chart and legends color
      var colors = _.map(prioroties, 'color');

      //prepare unique priority name for bar chart legends label
      var legends = _.map(prioroties, 'name');

      //prepare bar chart series
      var series = {};
      _.forEach(categories, function (category) {
        _.forEach(prioroties, function (priority) {
          var serie = series[priority.name] || {
            name: priority.name,
            type: 'bar',
            label: {
              normal: {
                show: true,
                position: 'top'
              }
            },
            data: []
          };

          //obtain all standings of specified jurisdiction(category)
          //and priority
          var value =
            _.filter($scope.standings, function (standing) {
              return (standing.jurisdiction.name ===
                category &&
                standing.priority.name === priority.name);
            });
          value = value ? _.sumBy(value, 'count') : 0;
          serie.data.push({
            value: value,
            itemStyle: {
              normal: {
                color: priority.color
              }
            }
          });
          series[priority.name] = serie;
        });
      });
      series = _.values(series);

      //prepare chart config
      $scope.perJurisdictionPerPriorityConfig = {
        height: 400,
        width: 1200
      };

      //prepare chart options
      $scope.perJurisdictionPerPriorityOptions = {
        color: colors,
        textStyle: {
          fontFamily: 'Lato'
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{b} : {c}'
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: legends
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              name: 'Issue per Area Per Priority-' + new Date().getTime(),
              title: 'Save',
              show: true
            }
          }
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          data: categories
        }],
        yAxis: [{
          type: 'value'
        }],
        series: series
      };

    };


    //listen for events and reload overview accordingly
    $rootScope.$on('app:servicerequests:reload', function () {
      Summary.standings().then(function (standings) {
        $scope.standings = standings;
        $scope.prepare();
      });
    });


    //on load
    //prepare overview details
    $scope.prepare();


  });

angular.module('ng311').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/_partials/aside.html',
    " <div class=\"navside\" data-layout=\"column\"> <div class=\"navbar no-radius\"> <a title=\"{{ENV.title}} | {{ENV.description}}\" ui-sref=\"app.servicerequests.list\" class=\"navbar-brand\"> <img src=\"images/logo_sm.daaf6944.png\" alt=\".\" width=\"48\" class=\"m-t-sm\"> <span class=\"hidden-folded inline\">open311</span> </a> </div> <br> <div data-flex class=\"hide-scroll\"> <nav class=\"scroll nav-stacked nav-stacked-rounded nav-color\"> <ul class=\"nav\" data-ui-nav> <li class=\"nav-header hidden-folded\"> <span class=\"text-xs\">Main</span> </li> <li ui-sref-active=\"active\"> <a ui-sref=\"app.servicerequests.list\" title=\"Issues & Service Request\"> <span class=\"nav-icon\"> <i class=\"ion-chatbubble-working\"></i> </span> <span class=\"nav-text\">Issues</span> </a> </li> <li ui-sref-active=\"active\"> <a ui-sref=\"app.create_servicerequests\" ui-sref-opts=\"{reload: true}\" title=\"Report New Issue or Service Request\"> <span class=\"nav-icon\"> <i class=\"ion-plus-circled\"></i> </span> <span class=\"nav-text\">New Issue</span> </a> </li> <li ui-sref-active=\"active\"> <a ui-sref=\"app.overviews\" title=\"Overviews\"> <span class=\"nav-icon\"> <i class=\"ion-pie-graph\"></i> </span> <span class=\"nav-text\">Overviews</span> </a> </li> <li ui-sref-active=\"active\"> <a ui-sref=\"app.standings\" title=\"Standings\"> <span class=\"nav-icon\"> <i class=\"ion-arrow-graph-up-right\"></i> </span> <span class=\"nav-text\">Standings</span> </a> </li> <li ui-sref-active=\"active\"> <a ui-sref=\"app.manage.jurisdictions\" title=\"Manage System\"> <span class=\"nav-icon\"> <i class=\"ion-gear-a\"></i> </span> <span class=\"nav-text\">Manage</span> </a> </li> </ul> </nav> </div> <div data-flex-no-shrink> <div uib-dropdown class=\"nav-fold dropup\" title=\"{{party.name}}\"> <a uib-dropdown-toggle data-toggle=\"dropdown\"> <div class=\"pull-left\"> <div class=\"inline\"> <letter-avatar title=\"{{party.name}}\" data=\"{{party.name}}\" height=\"60\" width=\"60\" shape=\"round\" class=\"avatar w-40\"> </letter-avatar> </div> </div> </a> <div uib-dropdown-menu class=\"dropdown-menu w dropdown-menu-scale\"> <a class=\"dropdown-item\" href=\"#\" title=\"My Profile\"> <span>Profile</span> </a> <a ng-show=\"isAuthenticated\" ng-show=\"isAuthenticated\" data-signout title=\"Signout\" class=\"dropdown-item\" title=\"Signout\"> Sign out </a> </div> </div> </div> </div> "
  );


  $templateCache.put('views/_partials/list_pager.html',
    "<span ng-class=\"{disabled: noPrevious()||ngDisabled, previous: align}\"> <a href ng-click=\"selectPage(page - 1, $event)\" ng-disabled=\"noPrevious()||ngDisabled\" uib-tabindex-toggle class=\"btn btn-default btn-xs\"> <i class=\"fa fa-fw fa-angle-left\"></i> </a> </span> <span> <a href ng-click=\"$parent.all()\" class=\"btn btn-default btn-xs\"> <i class=\"fa fa-fw fa-sort-amount-desc\"></i> </a> </span> <span ng-class=\"{disabled: noNext()||ngDisabled, next: align}\"> <a href ng-click=\"selectPage(page + 1, $event)\" ng-disabled=\"noNext()||ngDisabled\" uib-tabindex-toggle class=\"btn btn-default btn-xs\"> <i class=\"fa fa-fw fa-angle-right\"></i> </a> </span> "
  );


  $templateCache.put('views/_partials/top_navbar.html',
    " <nav class=\"site-navbar navbar navbar-default navbar-mega\" role=\"navigation\"> <div class=\"navbar-header\"> <div class=\"navbar-brand navbar-brand-center\"> <span class=\"navbar-brand-text\">ShuleDirect</span> </div> </div> <div class=\"navbar-container container-fluid\"> <ul class=\"nav navbar-toolbar navbar-right navbar-toolbar-right\"> <li> <a title=\"Notifications\" aria-expanded=\"false\" role=\"button\"> <i class=\"icon ti-bell\" aria-hidden=\"true\"></i> <span class=\"badge badge-danger up\">5</span> </a> </li> <li> <a title=\"Messages\" aria-expanded=\"false\" data-animation=\"scale-up\" role=\"button\"> <i class=\"icon ti-email\" aria-hidden=\"true\"></i> <span class=\"badge badge-info up\">3</span> </a> </li> <li> <a class=\"letter-avatar navbar-avatar\" uib-tooltip=\"Profile\" tooltip-placement=\"bottom\"> <span class=\"avatar avatar-online\"> <letter-avatar data=\"{{party.name}}\" fontfamily=\"Lato\" height=\"40\" width=\"40\" shape=\"round\"> </letter-avatar> <i></i> </span> </a> </li> </ul> </div> </nav> "
  );


  $templateCache.put('views/app.html',
    " <div ng-include=\"'views/_partials/aside.html'\" class=\"app-aside fade nav-dropdown folded b-r\"></div> <div ui-view class=\"app-content\" role=\"main\"></div> "
  );


  $templateCache.put('views/auth/_partials/profile.html',
    " <div class=\"col-md-12\"> <letter-avatar title=\"{{party.name}}\" data=\"{{party.name}}\" height=\"60\" width=\"60\" shape=\"round\"> </letter-avatar> </div> <div class=\"col-md-4 margin-top-40\"> <form name=\"profileForm\" role=\"form\" autocomplete=\"off\"> <div class=\"form-group form-material floating\"> <input type=\"text\" class=\"form-control\" name=\"name\" ng-model=\"party.name\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Name</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"text\" class=\"form-control\" name=\"phone\" ng-model=\"party.phone\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Phone Number</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"email\" class=\"form-control\" name=\"email\" ng-model=\"party.email\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Email</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"password\" ng-change=\"onPasswordChange()\" class=\"form-control\" name=\"password\" ng-model=\"party.password\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Password</label> <span ng-show=\"party.password && party.password.length < 8\" class=\"help-block red-700 font-weight-400\">Password length must be atleast 8 characters</span> <span ng-show=\"!edit\" class=\"help-block help-block-password font-size-20\">****************</span> </div> <div ng-show=\"party.password && party.password.length >= 8\" class=\"form-group form-material floating margin-top-40\"> <input type=\"password\" ng-change=\"onConfirmPassword()\" class=\"form-control\" name=\"confirm\" ng-model=\"party.confirm\" ng-disabled=\"!edit\"> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Password Confirm</label> <span ng-show=\"passwordDontMatch\" class=\"help-block red-700 font-weight-400\">Password does not match</span> </div> </form> </div> "
  );


  $templateCache.put('views/auth/change.html',
    " <div class=\"container\"> <div class=\"card card-signin\"> <img class=\"profile-img\" src=\"images/icon-96.1292dd0a.png\" alt=\"Logo\"> <p class=\"text-center mgn-t20\">Type your new password</p> <form ng-submit=\"change()\" class=\"mgn-t30\" role=\"form\" autocomplete=\"off\"> <div class=\"form-group\"> <label for=\"password\" class=\"sr-only\">Password</label> <input ng-model=\"user.password\" type=\"password\" id=\"password\" class=\"form-control input-lg\" placeholder=\"New password\" required> </div> <button class=\"btn btn-lg btn-misc btn-block\" type=\"submit\">Change</button> <br> <a ui-sref=\"app.home\" class=\"display-block text-center m-t-md fs-sm\">Continue to use current password</a> </form> </div> </div> "
  );


  $templateCache.put('views/auth/forgot.html',
    " <div class=\"page-login-v3 layout-full\"> <div class=\"page animsition vertical-align text-center\"> <div class=\"page-content vertical-align-middle\"> <div class=\"panel\"> <div class=\"panel-body\"> <div class=\"brand margin-top-80 margin-bottom-40\"> <img src=\"images/logo_md.7144376c.png\" alt=\".\" width=\"84\"> </div> <p class=\"text-center font-size-12 margin-bottom-60 text-grey-700\">Enter your e-mail address below to reset your password</p> <form ng-submit=\"forgot()\" name=\"forgotForm\" role=\"form\" autocomplete=\"off\"> <div class=\"form-group form-material floating\"> <input type=\"email\" class=\"form-control\" name=\"email\" ng-model=\"user.email\" ng-required> <label class=\"floating-label\">Email</label> </div> <div class=\"form-group clearfix\"> <a class=\"pull-right text-blue-600\" ui-sref=\"signin\" title=\"Click to signin to your current account\"> Signin to your Account </a> </div> <button ng-disabled=\"forgotForm.$invalid || !user.email\" type=\"submit\" class=\"btn btn-primary btn-block btn-lg margin-top-40\">Submit</button> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/auth/profile.html',
    " <div class=\"container profile\"> <div class=\"row\"> <div class=\"col-md-offset-1\"> <div class=\"page-header margin-top-30 padding-left-20\"> <div class=\"page-header-actions\"> <button ng-click=\"onEdit()\" ng-hide=\"edit\" type=\"button\" class=\"btn btn-outline btn-default btn-md empty-btn\" title=\"Click to edit profile\"> <i class=\"icon icon-pencil\" aria-hidden=\"true\"></i> </button> <button ng-click=\"save()\" ng-show=\"edit && canSave\" type=\"button\" class=\"btn btn-primary btn-md empty-btn\" title=\"Click to save profile\"> Save </button> <button ng-click=\"onClose()\" ng-show=\"edit\" type=\"button\" class=\"btn btn-outline btn-default btn-md empty-btn\" title=\"Cancel profile edits\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </button> </div> </div> <div class=\"page-content page-content-table margin-top-20\"> <div class=\"container\"> <div class=\"row\"> <div ng-include=\"'views/auth/_partials/profile.html'\"></div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/auth/recover.html',
    " <div class=\"container\"> <div class=\"card card-signin\"> <img class=\"profile-img\" src=\"images/icon-96.1292dd0a.png\" alt=\"Logo\"> <p class=\"text-center mgn-t20\">Type your new password</p> <form ng-submit=\"recover()\" class=\"mgn-t30\" role=\"form\" autocomplete=\"off\"> <div class=\"form-group\"> <input ng-model=\"user.password\" type=\"password\" id=\"password\" class=\"form-control input-lg\" placeholder=\"Password\" required> </div> <button class=\"btn btn-lg btn-misc btn-block\" type=\"submit\">Submit</button> <br> <a ui-sref=\"signin\" class=\"display-block text-center m-t-md fs-sm\">Signin to your account</a> </form> </div> </div> "
  );


  $templateCache.put('views/auth/signin.html',
    " <div class=\"page-login-v3 layout-full\"> <div class=\"page animsition vertical-align text-center\"> <div class=\"page-content vertical-align-middle\"> <div class=\"panel\"> <div class=\"panel-body\"> <div class=\"brand margin-top-80 margin-bottom-60\"> <img src=\"images/logo_md.7144376c.png\" alt=\".\" width=\"84\"> </div> <form ng-submit=\"signin()\" name=\"signinForm\" role=\"form\" autocomplete=\"off\"> <div class=\"form-group form-material floating\"> <input type=\"email\" class=\"form-control\" name=\"email\" ng-model=\"user.email\" focus-if=\"!user.email\" ng-required> <label class=\"floating-label\">Email</label> </div> <div class=\"form-group form-material floating\"> <input type=\"password\" class=\"form-control\" name=\"password\" ng-model=\"user.password\" ng-required> <label class=\"floating-label\">Password</label> </div> <div class=\"form-group clearfix\"> <a class=\"pull-right text-blue-600\" ui-sref=\"forgot\" title=\"Click to request reset password\"> Forgot Password? </a> </div> <button ng-disabled=\"signinForm.$invalid || !user.email || !user.password\" type=\"submit\" class=\"btn btn-primary btn-block btn-lg margin-top-40\">Sign in</button> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/overviews.html',
    " <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"row-col\"> <div class=\"col-lg b-r\"> <div class=\"row no-gutter\"> <div class=\"col-xs-6 col-sm-3 b-r b-b\"> <div class=\"padding\"> <div> <span class=\"pull-right\"> <i class=\"fa fa-caret-up text-primary m-y-xs\"></i> </span> <span class=\"text-muted l-h-1x\"> <i class=\"ion-ios-grid-view text-muted\"></i> </span> </div> <div class=\"text-center\"> <h2 class=\"text-center _600\">{{issues.total}}</h2> <p class=\"text-muted m-b-md\">Reported Issues</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-r b-b\"> <div class=\"padding\"> <div> <span class=\"pull-right\"> <i class=\"fa fa-caret-up text-primary m-y-xs\"></i> </span> <span class=\"text-muted l-h-1x\"> <i class=\"ion-document text-muted\"></i> </span> </div> <div class=\"text-center\"> <h2 class=\"text-center _600\">{{issues.resolved}}</h2> <p class=\"text-muted m-b-md\">Resolved Issues</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-r b-b\"> <div class=\"padding\"> <div> <span class=\"pull-right\"> <i class=\"fa fa-caret-down text-danger m-y-xs\"></i> </span> <span class=\"text-muted l-h-1x\"> <i class=\"ion-android-document text-muted\"></i> </span> </div> <div class=\"text-center\"> <h2 class=\"text-center _600\">{{issues.unresolved}}</h2> <p class=\"text-muted m-b-md\">Un-Resolved Issues</p> </div> </div> </div> <div class=\"col-xs-6 col-sm-3 b-b\"> <div class=\"padding\"> <div> <span class=\"pull-right\"> <i class=\"fa fa-caret-up text-primary m-y-xs\"></i> </span> <span class=\"text-muted l-h-1x\"> <i class=\"icon-call-in text-muted\"></i> </span> </div> <div class=\"text-center\"> <h2 class=\"text-center _600\"> <span title=\"Average Call Duration - Minutes Spent\"> {{issues.averageCallDuration.minutes}}<span class=\"text-muted text-xs\">minutes</span> </span> <span title=\"Average Call Duration - Seconds Spent\"> {{issues.averageCallDuration.seconds}}<span class=\"text-muted text-xs\">seconds</span> </span> </h2> <p class=\"text-muted m-b-md\">Average Call Duration</p> </div> </div> </div> </div> <div class=\"padding\"> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Area</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Area </small> </div> <div class=\"box-body\"> <echart config=\"jurisdictionConfig\" options=\"jurisdictionOptions\"></echart> </div> </div> </div> </div> </div> <div class=\"padding\"> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Service Group</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Service Group </small> </div> <div class=\"box-body\"> <pie-chart config=\"groupConfig\" data=\"groupData\" font-style=\"Lato\"></pie-chart> </div> </div> </div> </div> </div> <div class=\"padding\"> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Service</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Service </small> </div> <div class=\"box-body\"> <echart config=\"serviceConfig\" options=\"serviceOptions\"></echart> </div> </div> </div> </div> </div> <div class=\"padding\"> <div class=\"row\"> <div class=\"col-sm-6\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Status</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Status </small> </div> <div class=\"box-body\"> <pie-chart config=\"statusConfig\" data=\"statusData\"></pie-chart> </div> </div> </div> <div class=\"col-sm-6\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Priority</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Priorities </small> </div> <div class=\"box-body\"> <pie-chart config=\"priorityConfig\" data=\"priorityData\"></pie-chart> </div> </div> </div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/dashboards/standings.html',
    " <div class=\"app-header bg b-b\" style=\"background-color: white\"> <div class=\"navbar\"> <div class=\"navbar-item pull-left h5 text-md\"> Standing - Reports </div> <ul class=\"nav navbar-nav pull-right\"> <li class=\"nav-item\"> <a class=\"nav-link\" data-toggle=\"dropdown\" aria-expanded=\"false\" title=\"Click to Filter Report\"> <i class=\"ion-android-funnel w-24\" title=\"Click To Filter Reports\"></i> </a> </li> </ul> </div> </div> <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"row-col\"> <div class=\"col-lg b-r\"> <div class=\"padding\"> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Area - Work Load</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Area </small> </div> <div class=\"box-body\"> <echart config=\"perJurisdictionConfig\" options=\"perJurisdictionOptions\"></echart> </div> </div> </div> </div> </div> <div class=\"padding\"> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Area per Service Group - Affected Business Units(Divisions)</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Area and Service Group </small> </div> <div class=\"box-body\"> <echart config=\"perJurisdictionPerServiceGroupConfig\" options=\"perJurisdictionPerServiceGroupOptions\"></echart> </div> </div> </div> </div> </div> <div class=\"padding\"> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Area per Service - Impacted Business Services</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Area and Service </small> </div> <div class=\"box-body\"> <echart ng-repeat=\"options in perJurisdictionPerServiceOptions\" config=\"perJurisdictionPerServiceConfig\" options=\"options\"></echart> </div> </div> </div> </div> </div> <div class=\"padding\"> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Area per Priority - Work Severity</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Area and Priority </small> </div> <div class=\"box-body\"> <echart config=\"perJurisdictionPerPriorityConfig\" options=\"perJurisdictionPerPriorityOptions\"></echart> </div> </div> </div> </div> </div> <div class=\"padding\"> <div class=\"row\"> <div class=\"col-sm-12\"> <div class=\"box\"> <div class=\"box-header\"> <h3>Issue per Area per Status - Work Progress</h3> <small class=\"block text-muted\"> Count of Reported Issues by Their Area and Status </small> </div> <div class=\"box-body\"> <echart config=\"perJurisdictionPerStatusConfig\" options=\"perJurisdictionPerStatusOptions\"></echart> </div> </div> </div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/jurisdictions/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Jurisdiction Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Jurisdiction\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted\" title=\"Click to edit jurisdiction\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"save()\" class=\"nav-link text-muted\" title=\"Click to save jurisdiction\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/jurisdictions/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/jurisdictions/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"jurisdictionForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div title=\"Jurisdiction Name\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.code\" ng-required ng-minlength=\"1\" type=\"text\" name=\"code\" class=\"form-control\"> <label title=\"Jurisdiction Code\" class=\"floating-label\">Code</label> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6\" title=\"Jurisdiction Name\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> <label title=\"Jurisdiction Name\" class=\"floating-label\">Name</label> </div> </div> <div class=\"col-sm-6\" title=\"Jurisdiction Phone\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.phone\" ng-required ng-minlength=\"2\" type=\"text\" name=\"phone\" class=\"form-control\"> <label title=\"Mobile Phone Number\" class=\"floating-label\">Phone</label> </div> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6\" title=\"Jurisdiction Email\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.email\" ng-required ng-minlength=\"2\" type=\"text\" name=\"email\" class=\"form-control\"> <label title=\"Email Address\" class=\"floating-label\">Email</label> </div> </div> <div class=\"col-sm-6\" title=\"Jurisdiction Domain\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.domain\" ng-required ng-minlength=\"2\" type=\"text\" name=\"domain\" class=\"form-control\"> <label title=\"Domain Name\" class=\"floating-label\">Domain</label> </div> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6\" title=\"Jurisdiction Longitude\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.longitude\" ng-required type=\"number\" name=\"longitude\" class=\"form-control\"> <label title=\"Longitude\" class=\"floating-label\">Longitude</label> </div> </div> <div class=\"col-sm-6\" title=\"Jurisdiction Latitude\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"jurisdiction.latitude\" ng-required type=\"number\" name=\"latitude\" class=\"form-control\"> <label title=\"Latitude\" class=\"floating-label\">Latitude</label> </div> </div> </div> <div class=\"m-t-lg\" title=\"Jurisdiction Details\"> <div class=\"form-group form-material floating\"> <textarea ng-disabled=\"!edit\" ng-model=\"jurisdiction.about\" msd-elastic name=\"about\" class=\"form-control\" rows=\"2\">\n" +
    "                                        </textarea> <label class=\"floating-label\">About</label> </div> </div> <div class=\"m-t-lg\" title=\"Jurisdiction Physical Address\"> <div class=\"form-group form-material floating\"> <textarea ng-disabled=\"!edit\" ng-model=\"jurisdiction.address\" msd-elastic name=\"about\" class=\"form-control\" rows=\"2\">\n" +
    "                                        </textarea> <label class=\"floating-label\">Physical Address</label> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/jurisdictions/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Jurisdictions ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(jurisdiction)\" class=\"list-item list-item-padded\" ng-repeat=\"jurisdiction in jurisdictions\" title=\"{{jurisdiction.about}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Jurisdiction Code\" data=\"{{jurisdiction.code}}\" height=\"60\" width=\"60\" color=\"{{jurisdiction.color}}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Jurisdiction Phone Number\" class=\"pull-right text-xs text-muted\"> {{jurisdiction.phone}} </span> <div class=\"item-title\"> <span title=\"Jurisdiction Name\" class=\"_500\">{{jurisdiction.name}}</span> </div> <p title=\"Jurisdiction Details\" class=\"block text-muted text-ellipsis\"> {{jurisdiction.about}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"> </div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/manage/main.html',
    " <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"row-col\"> <div ng-include=\"'views/manage/side_subnav.html'\" class=\"col-xs-3 w modal fade aside aside-md manages-aside\" id=\"subnav\"></div> <div ui-view=\"list\" class=\"col-xs-3 w-xl modal fade aside aside-sm b-r\" id=\"list\"> </div> <div ui-view=\"detail\" class=\"col-xs-6 bg\" id=\"detail\"></div> </div> </div> </div> "
  );


  $templateCache.put('views/manage/side_subnav.html',
    " <div class=\"row-col bg b-r\"> <div class=\"b-b\"> <div class=\"navbar\"> <ul class=\"nav navbar-nav\"> <li class=\"nav-item\"> <span class=\"navbar-item text-md\">Settings</span> </li> </ul> </div> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\" title=\"System Settings\">System</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.jurisdictions\" class=\"nav-link text-muted block\"> Jurisdictions </a> </li> <li ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.servicegroups\" class=\"nav-link text-muted block\"> Groups </a> </li> <li ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.services\" class=\"nav-link text-muted block\"> Services </a> </li> <li ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.priorities\" class=\"nav-link text-muted block\"> Priorities </a> </li> <li ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.statuses\" class=\"nav-link text-muted block\"> Statuses </a> </li> </ul> </div> </div> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\" title=\"General Settings\">General</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.parties\" class=\"nav-link text-muted block\"> Parties </a> </li> <li ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a ui-sref=\"app.manage.roles\" class=\"nav-link text-muted block\"> Roles </a> </li> <li ui-sref-active=\"active\" class=\"nav-item m-b-xs\"> <a hre=\"#\" class=\"nav-link text-muted block\"> Configuration </a> </li> </ul> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/parties/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Jurisdiction Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Jurisdiction\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted\" title=\"Click to edit party\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"save()\" class=\"nav-link text-muted\" title=\"Click to save party\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/parties/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/parties/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"partyForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Area\"> <div ng-show=\"!edit\" class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"party.jurisdiction.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"area\" class=\"form-control\"> <label title=\"Area\" class=\"floating-label\">Area</label> </div> <div ng-show=\"edit\" class=\"form-group form-material floating\"> <oi-select oi-options=\"item.name for item in jurisdictions track by item.id\" ng-model=\"party.jurisdiction\" placeholder=\"Select Area\" class=\"form-control\"></oi-select> <label title=\"Area\" class=\"floating-label\">Area</label> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6\" title=\"Party Name\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"party.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> <label title=\"Party Name\" class=\"floating-label\">Name</label> </div> </div> <div class=\"col-sm-6\" title=\"Party Phone\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"party.phone\" ng-required ng-minlength=\"2\" type=\"text\" name=\"phone\" class=\"form-control\"> <label title=\"Mobile Phone Number\" class=\"floating-label\">Phone</label> </div> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-6\" title=\"Party Email\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"party.email\" ng-required ng-minlength=\"2\" type=\"text\" name=\"email\" class=\"form-control\"> <label title=\"Email Address\" class=\"floating-label\">Email</label> </div> </div> <div class=\"col-sm-6\" title=\"SIP Number\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"party.sipNumber\" ng-required ng-minlength=\"2\" type=\"text\" name=\"sipNumber\" class=\"form-control\"> <label title=\"SIP Phone Number\" class=\"floating-label\">SIP Number</label> </div> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-12\"> <div ng-show=\"!edit\" class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"party._roles\" ng-required ng-minlength=\"2\" type=\"text\" name=\"_roles\" class=\"form-control\"> <label title=\"Roles\" class=\"floating-label\">Roles</label> </div> <div ng-show=\"edit\" class=\"form-inputs\"> <div class=\"form-group\"> <label class=\"floating-label\">Roles</label> <div class=\"checkbox-custom checkbox-primary\" ng-repeat=\"role in roles\"> <input type=\"checkbox\" checklist-model=\"party._assigned\" checklist-value=\"role._id\"> <label>{{role.name}}</label> </div> </div> </div> </div> </div> </div> </div></form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/parties/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Parties ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(party)\" class=\"list-item list-item-padded\" ng-repeat=\"party in parties\" title=\"{{party.about}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Avatar\" data=\"{{party.name}}\" height=\"60\" width=\"60\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Working Area\" class=\"pull-right text-xs text-muted\"> {{party.jurisdiction.name}} </span> <div class=\"item-title\" title=\"Full Name\"> <span class=\"_500\">{{party.name}}</span> </div> <p title=\"Work Description\" class=\"block text-muted text-ellipsis\"> {{party.relation.type}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"> </div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/priorities/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Priority Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Priority\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted\" title=\"Click to edit priority\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"save()\" class=\"nav-link text-muted\" title=\"Click to save priority\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/priorities/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/priorities/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"priorityForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Priority Name\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"priority.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> <label title=\"Priority Name\" class=\"floating-label\">Name</label> </div> </div> <div class=\"m-t-lg\" title=\"Priority Weight\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"priority.weight\" ng-required type=\"number\" name=\"name\" class=\"form-control\"> <label title=\"Priority Weight\" class=\"floating-label\">Weight</label> </div> </div> <div class=\"m-t-lg\" title=\"Priority Color\"> <color-picker ng-model=\"priority.color\"> </color-picker> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/priorities/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Priorities ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(priority)\" class=\"list-item list-item-padded\" ng-repeat=\"priority in priorities\" title=\"{{priority.about}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Priority Visual Color\" data=\"{{priority.name}}\" height=\"60\" width=\"60\" color=\"{{priority.color}}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Priority Weight\" class=\"pull-right text-xs text-muted\"> {{priority.weight}} </span> <div class=\"item-title\" title=\"Priority Name\"> <span class=\"_500\">{{priority.name}}</span> </div> <p title=\"Priority Description\" class=\"block text-muted text-ellipsis\"> {{priority.name}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"> </div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/roles/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Role Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Role\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted\" title=\"Click to edit role\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"save()\" class=\"nav-link text-muted\" title=\"Click to save role\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/roles/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/roles/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"roleForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Role Name\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"role.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> <label title=\"Role Name\" class=\"floating-label\">Name</label> </div> </div> <div class=\"m-t-lg\" title=\"Role Description\"> <div class=\"form-group form-material floating\"> <textarea ng-disabled=\"!edit\" ng-model=\"role.description\" msd-elastic name=\"description\" class=\"form-control\" rows=\"2\">\n" +
    "                    </textarea> <label class=\"floating-label\">Description</label> </div> </div> <div class=\"row m-t-lg\"> <div class=\"col-sm-12\"> <div class=\"form-inputs form-inputs-material\"> <div class=\"form-group\" ng-class=\"{'form-group-disabled':!edit}\"> <label class=\"floating-label\">Permissions</label> <div class=\"row\"> <div class=\"col-md-4\" ng-repeat=\"permission in grouped\"> <h6>{{permission.resource}}</h6> <div class=\"checkbox-custom checkbox-primary\" ng-repeat=\"permit in permission.permits | orderBy : resource\"> <input ng-show=\"edit\" type=\"checkbox\" checklist-model=\"role._assigned\" checklist-value=\"permit._id\"> <label title=\"{{permit.description}}\">{{permit.resource}} {{permit.action}}</label> </div> <br> </div> </div> </div> </div> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/roles/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Roles ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(role)\" class=\"list-item list-item-padded\" ng-repeat=\"role in roles\" title=\"{{role.description}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Role Visual Color\" data=\"{{role.name}}\" height=\"60\" width=\"60\" color=\"{{role.color}}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <div class=\"item-title\" title=\"Role Name\"> <span class=\"_500\">{{role.name}}</span> </div> <p title=\"Role Description\" class=\"block text-muted text-ellipsis\"> {{role.description}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"> </div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/servicegroups/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Service Group Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Service Group\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted\" title=\"Click to edit service group\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"save()\" class=\"nav-link text-muted\" title=\"Click to save service group\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/servicegroups/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/servicegroups/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"servicegroupForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Service Group Name\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"servicegroup.code\" ng-required ng-minlength=\"1\" type=\"text\" name=\"code\" class=\"form-control\"> <label title=\"Service Group Code\" class=\"floating-label\">Code</label> </div> </div> <div class=\"m-t-lg\" title=\"Service Group Name\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"servicegroup.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> <label title=\"Service Group Name\" class=\"floating-label\">Name</label> </div> </div> <div class=\"m-t-lg\" title=\"Service Group Weight\"> <div class=\"form-group form-material floating\"> <textarea ng-disabled=\"!edit\" ng-model=\"servicegroup.description\" msd-elastic name=\"about\" class=\"form-control\" rows=\"3\">\n" +
    "                                        </textarea> <label class=\"floating-label\">Description</label> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicegroups/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Service Groups ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(servicegroup)\" class=\"list-item list-item-padded\" ng-repeat=\"servicegroup in servicegroups\" title=\"{{servicegroup.description}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Service Group Code\" data=\"{{servicegroup.code}}\" height=\"60\" width=\"60\" color=\"{{servicegroup.color}}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Service Group Code\" class=\"pull-right text-xs text-muted\"> {{servicegroup.code}} </span> <div title=\"Service Group Name\" class=\"item-title\"> <span class=\"_500\">{{servicegroup.name}}</span> </div> <p class=\"block text-muted text-ellipsis\"> {{servicegroup.description}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"> </div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/_list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-enter=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Issues ...\"> <span class=\"input-group-btn\"> <button ng-click=\"onSearch()\" class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\" id=\"scrollable-servicerequest-list\"> <div class=\"list\" data-ui-list=\"info\"> <div infinite-scroll=\"paginate()\" infinite-scroll-disabled=\"paginating\" infinite-scroll-distance=\"1\" infinite-scroll-container='\"#scrollable-servicerequest-list\"'> <div ng-click=\"select(servicerequest)\" class=\"list-item list-item-padded\" ng-repeat=\"servicerequest in servicerequests\" title=\"{{servicerequest.description}}\" style=\"border-left: 2px solid {{servicerequest.priority.color || '#f3c111'}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Status & Area\" data=\"{{servicerequest.jurisdiction.name}}\" height=\"60\" width=\"60\" shape=\"round\" color=\"{{servicerequest.status.color}}\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Issue Report Date\" class=\"pull-right text-xs text-muted\"> {{servicerequest.createdAt | date:'dd MMM yyyy HH:mm'}} </span> <div class=\"item-title\"> <a href=\"#\" class=\"_500\">{{servicerequest.service.name}} <br><span title=\"Issue Number\" class=\"font-size-12\"> #{{servicerequest.code}}</span></a> </div> <small class=\"block text-xs text-muted text-ellipsis\"> <span title=\"Reporter Name\"> <i class=\"icon-user\"></i>&nbsp;&nbsp;{{(servicerequest.reporter.name) || 'NA'}} </span> <span class=\"pull-right\" title=\"Reporter Phone Number\"> <i class=\"icon-phone\"></i>&nbsp;&nbsp;{{(servicerequest.reporter.phone) ||'NA'}} </span> </small> </div> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\" style=\"padding-left: 12px\"> </div> <div class=\"btn-group pull-right\"> <a title=\"Click To Refresh Issues\" ng-click=\"load({ resolvedAt: null, operator: { $ne: null }, resetPage:true}, false)\" class=\"btn btn-default btn-xs\"> <i class=\"icon-reload\"></i> </a> <a title=\"Click To Export Issues\" class=\"btn btn-default btn-xs\" ng-csv=\"export\" csv-header=\"['Issue Number','Reported Date','Call Start Time', 'Call End Time','Call Duration(Minutes)', 'Call Duration(Seconds)', 'Reporter Name', 'Reporter Phone', 'Reporter Account', 'Operator', 'Area', 'Service Group', 'Service', 'Assignee', 'Description', 'Address', 'Status', 'Priority', 'Resolved Date', 'Time Taken(days)', 'Time Taken(hrs)', 'Time Taken(mins)', 'Time Taken(secs)']\" filename=\"issues.csv\"> <i class=\"icon-cloud-download\"></i> </a> </div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li class=\"nav-item\"> <a ng-if=\"mailTo\" href=\"{{mailTo}}\" class=\"nav-link text-muted\" title=\"Send Issue to Area\"> <span class=\"nav-text\"> <i class=\"icon-action-redo\"></i> </span> </a> </li> <li ng-if=\"!servicerequest.resolvedAt\" class=\"nav-item b-l p-l\"> <a ng-click=\"onClose()\" class=\"nav-link text-muted no-border\" title=\"Click To Signal Feedback Provided To Reporter\"> <span class=\"nav-text\"> <i class=\"icon-call-out\"></i> </span> </a> </li> <li ng-if=\"servicerequest.resolvedAt\" class=\"nav-item b-l p-l\"> <a ng-click=\"onReOpen()\" class=\"nav-link text-muted no-border\" title=\"Click To Re-Open The Issue\"> <span class=\"nav-text\"> <i class=\"icon-call-in\"></i> </span> </a> </li> <li class=\"nav-item b-l p-l\"> <a ng-click=\"onCopy()\" class=\"nav-link text-muted no-border\" title=\"Click To Copy Reporter Information & Create New Issue\"> <span class=\"nav-text\"> <i class=\"ti-cut\"></i> </span> </a> </li> <li class=\"nav-item b-l p-l p-r\"> <a print-btn class=\"nav-link text-muted no-border\" title=\"Click To Print Issue\"> <span class=\"nav-text\"> <i class=\"icon-printer\"></i> </span> </a> </li> </ul> "
  );


  $templateCache.put('views/servicerequests/_partials/comments.html',
    " <div class=\"padding b-t\"> <h6 class=\"m-b\" title=\"Internal Notes & Comments\">Internal Notes</h6> <div class=\"p-a\"> <div print-hide ng-if=\"!servicerequest.resolvedAt\" class=\"p-a p-y-sm b-t b-b m-b\"> <form> <div class=\"input-group b-a b-transparent\"> <input ng-enter=\"comment()\" ng-model=\"note.content\" type=\"text\" class=\"form-control no-border font-size-12\" placeholder=\"Write your note\" id=\"internal-comment-box\"> <span class=\"input-group-btn\"> <button ng-click=\"comment()\" class=\"btn no-bg no-shadow\" type=\"button\"> <i class=\"fa fa-send text-success\"></i> </button> </span> </div> </form> </div> <div class=\"streamline streamline-theme m-b\"> <div class=\"sl-item\" ng-repeat=\"comment in comments\"> <div class=\"sl-content\"> <div class=\"sl-date text-muted\"> <span class=\"text-info\"> {{comment.commentator.name}} </span> on {{comment.createdAt | date:'dd MMM yyyy hh:mm:ss a'}}</div> <p>{{comment.content}}</p> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/create.html',
    " <div class=\"row-col\"> <div class=\"b-b bg\"> <div class=\"box-header\" style=\"padding:1.2rem\"> <h2>Report New Issue</h2> </div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"servicerequestForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-header\"> <h6>Reporter Details</h6> </div> <div class=\"box-body\"> <div class=\"row m-b\"> <div class=\"col-sm-6\"> <div class=\"form-group form-material floating\"> <input ng-model=\"servicerequest.reporter.phone\" ng-required ng-minlength=\"2\" focus-if=\"!servicerequest.reporter.phone\" type=\"text\" name=\"phone\" class=\"form-control\"> <label class=\"floating-label\">Phone</label> </div> </div> <div class=\"col-sm-6\"> <div class=\"form-group form-material floating\"> <input ng-model=\"servicerequest.reporter.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> <label class=\"floating-label\">Name</label> </div> </div> </div> <div class=\"row m-b\"> <div class=\"col-sm-6\"> <div class=\"form-group form-material floating\"> <input ng-model=\"servicerequest.reporter.account\" ng-required ng-minlength=\"2\" type=\"text\" name=\"account\" class=\"form-control\"> <label class=\"floating-label\">Account</label> </div> </div> <div class=\"col-sm-6\"> <div class=\"form-group form-material floating\"> <input ng-model=\"servicerequest.reporter.email\" ng-required ng-minlength=\"2\" type=\"text\" name=\"email\" class=\"form-control\"> <label class=\"floating-label\">Email</label> </div> </div> </div> <div class=\"p-t p-b m-t\" style=\"margin-top: 4rem\"> <h6> Issue Details </h6> </div> <div class=\"row m-b\"> <div class=\"col-sm-6\"> <div class=\"form-group form-material floating\"> <oi-select oi-options=\"item.name for item in services track by item.id\" ng-model=\"servicerequest.service\" placeholder=\"Select Service\" class=\"form-control\"></oi-select> </div> </div> <div class=\"col-sm-6\"> <div class=\"form-group form-material floating\"> <oi-select oi-options=\"item.name for item in jurisdictions track by item.id\" ng-model=\"servicerequest.jurisdiction\" placeholder=\"Select Area\" class=\"form-control\"></oi-select> </div> </div> </div> <div class=\"form-group form-material floating\"> <textarea ng-model=\"servicerequest.address\" msd-elastic name=\"address\" class=\"form-control\" rows=\"2\">\n" +
    "                                    </textarea> <label class=\"floating-label\">Address</label> </div> <div class=\"form-group form-material floating\"> <textarea ng-model=\"servicerequest.description\" msd-elastic name=\"description\" class=\"form-control\" rows=\"3\">\n" +
    "                                    </textarea> <label class=\"floating-label\">Description</label> </div> </div> <div class=\"p-a text-right\"> <button ui-sref=\"app.servicerequests.list\" type=\"button\" ng-click=\"cancel()\" class=\"btn\">Cancel</button> <button ng-disabled=\"servicerequest.$invalid || !servicerequest.reporter.phone\" type=\"submit\" class=\"btn info\">Submit</button> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/servicerequests/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\" print-section> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <h4 class=\"_600\"> <span title=\"Issue Nature\"> {{servicerequest.service.name}} </span> - <span title=\"Issue Number\"> #{{servicerequest.code}} </span> <span class=\"pull-right font-size-14\"> <span title=\"Issue Group/Category\"> <span class=\"text-muted font-size-10\">Group</span> {{servicerequest.group.name}} </span> <br> <span title=\"Area Responsible\"> <span class=\"text-muted font-size-10\">Area</span> {{servicerequest.jurisdiction.name}} </span> <br> <span ng-if=\"servicerequest.jurisdiction.phone && servicerequest.jurisdiction.phone != 'N/A'\" title=\"Area Phone Number\"> <span class=\"text-muted font-size-10\">Phone</span> {{servicerequest.jurisdiction.phone}} </span> </span> </h4> <div class=\"p-y\"> <div title=\"Reporter Name\"> <span class=\"text-muted font-size-12\">From: </span> <span ng-click=\"filterByReporter(servicerequest.reporter.name, {'reporter.name':servicerequest.reporter.name, resolvedAt:null, operator:servicerequest.operator})\">{{servicerequest.reporter.name}}</span> </div> <div title=\"Reporter Account Number\"> <span class=\"text-muted font-size-12\">Account #: </span> <span ng-click=\"filterByReporter(servicerequest.reporter.account, {'reporter.account':servicerequest.reporter.account, resolvedAt:null, operator:servicerequest.operator})\">{{servicerequest.reporter.account}}</span> </div> <div title=\"Reporter Phone Number\"> <span class=\"text-muted font-size-12\">Phone #: </span> <span ng-click=\"filterByReporter(servicerequest.reporter.phone, {'reporter.phone':servicerequest.reporter.phone, resolvedAt:null, operator:servicerequest.operator})\">{{servicerequest.reporter.phone}}</span> </div> <div title=\"Reporter Address\"> <span class=\"text-muted font-size-12\">Address: </span> <span>{{servicerequest.address}}</span> </div> </div> <div class=\"p-y b-t\" ng-show=\"servicerequest.call.startedAt && servicerequest.call.endedAt\"> <span title=\"Call Start Time\"> <span class=\"text-muted font-size-12\"> Call Start: </span> <span class=\"font-size-12\">{{servicerequest.call.startedAt | date:'dd MMM yyyy hh:mm:ss a'}}</span> </span> <span title=\"Call End Time\" class=\"p-l\"> <span class=\"text-muted font-size-12\">Call End: </span> <span class=\"font-size-12\">{{servicerequest.call.endedAt | date:'dd MMM yyyy hh:mm:ss a'}}</span> </span> <span title=\"Call Duration\" class=\"p-l\"> <span class=\"text-muted font-size-12\">Call Duration: </span> <span class=\"font-size-12\">{{servicerequest.call.duration.human}}</span> </span> </div> <div class=\"p-b\"> <span title=\"Date Issue Reported\"> <span class=\"text-muted font-size-12\">Reported: </span> <span class=\"font-size-12\">{{servicerequest.createdAt | date:'dd MMM yyyy hh:mm:ss a'}}</span> </span> <span ng-if=\"servicerequest.resolvedAt\" title=\"Date Issue Resolved\" class=\"p-l\"> <span class=\"text-muted font-size-12\">Resolved: </span> <span class=\"font-size-12\">{{servicerequest.resolvedAt | date:'dd MMM yyyy hh:mm:ss a'}}</span> </span> <span ng-if=\"servicerequest.resolvedAt\" title=\"Time Taken To Resolve\" class=\"p-l\"> <span class=\"text-muted font-size-12\">TTR: </span> <span class=\"font-size-12\"> {{servicerequest.ttr.human}} </span> </span> </div> <div class=\"p-y b-t\"> <span title=\"Operator Responsible\"> <span class=\"text-muted font-size-12\">Operator: </span> <span>{{servicerequest.operator.name}}</span> </span> <span uib-dropdown auto-close=\"outsideClick\" class=\"m-l\"> <span uib-dropdown-toggle class=\"text-muted font-size-12\">Assignee: </span> <span>{{servicerequest.assignee.name || 'N/A'}}</span> <div ng-if=\"!servicerequest.resolvedAt\" uib-dropdown-menu class=\"dropdown-menu w dropdown-menu-scale\"> <ul class=\"list no-border p-b\"> <li class=\"list-item\" title=\"Type To Search Assignee\"> <input ng-change=\"onSearchAssignees()\" ng-model=\"search.party\" type=\"text\" class=\"form-control form-control-sm\" placeholder=\"Search Assignee ...\"> </li> <li class=\"list-item\" ng-repeat=\"assignee in assignees\" ng-click=\"assign(assignee)\"> <div class=\"list-body\"> <div> <a href=\"#\">{{assignee.name}}</a> </div> <small class=\"text-muted text-ellipsis\"> {{assignee.relation.type}} </small> </div> </li> </ul> </div> </span> <span ng-if=\"!servicerequest.resolvedAt\" uib-dropdown class=\"label primary m-l\" title=\"Status\" style=\"background-color:{{servicerequest.status.color}}\"> <span uib-dropdown-toggle class=\"font-size-12 text-white\">Status: {{servicerequest.status.name}} </span> <div uib-dropdown-menu class=\"dropdown-menu w dropdown-menu-scale\"> <a ng-repeat=\"status in statuses\" ng-click=\"changeStatus(status)\" class=\"dropdown-item\" href=\"#\" title=\"Status - {{status.name}}\"> <span>{{status.name}}</span> </a> </div> </span> <span ng-if=\"!servicerequest.resolvedAt\" uib-dropdown class=\"label danger m-l\" title=\"Priority\" style=\"background-color:{{servicerequest.priority.color}}\"> <span uib-dropdown-toggle class=\"font-size-12 text-white\">Priority: {{servicerequest.priority.name}}</span> <div uib-dropdown-menu class=\"dropdown-menu w dropdown-menu-scale\"> <a ng-repeat=\"priority in priorities\" ng-click=\"changePriority(priority)\" class=\"dropdown-item\" href=\"#\" title=\"Priority {{priority.name}}\"> <span>{{priority.name}}</span> </a> </div> </span> <span ng-if=\"servicerequest.resolvedAt\" class=\"label danger m-l\" style=\"background-color: #4CAF50\"> <span class=\"font-size-12 text-white\">Resolved</span> </span> </div> </div> <div class=\"padding b-t\"> <h6 class=\"m-b\" title=\"Issue Description\">Description</h6> <p class=\"text-lt\"> {{servicerequest.description}} </p> <p>&nbsp;</p> </div> <div ng-include=\"'views/servicerequests/_partials/comments.html'\"></div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-enter=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Issues ...\"> <span class=\"input-group-btn\"> <button ng-click=\"onSearch()\" class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\" id=\"scrollable-servicerequest-list\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(servicerequest)\" class=\"list-item list-item-padded\" ng-repeat=\"servicerequest in servicerequests\" title=\"{{servicerequest.description}}\" style=\"border-left: 2px solid {{servicerequest.priority.color || '#f3c111'}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Status & Area\" data=\"{{servicerequest.jurisdiction.name}}\" height=\"60\" width=\"60\" shape=\"round\" color=\"{{servicerequest.status.color}}\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Issue Report Date\" class=\"pull-right text-xs text-muted\"> {{servicerequest.createdAt | date:'dd MMM yyyy HH:mm'}} </span> <div class=\"item-title\"> <a href=\"#\" class=\"_500\">{{servicerequest.service.name}} <br><span title=\"Issue Number\" class=\"font-size-12\"> #{{servicerequest.code}}</span></a> </div> <small class=\"block text-xs text-muted text-ellipsis\"> <span title=\"Reporter Name\"> <i class=\"icon-user\"></i>&nbsp;&nbsp;{{(servicerequest.reporter.name) || 'NA'}} </span> <span class=\"pull-right\" title=\"Reporter Phone Number\"> <i class=\"icon-phone\"></i>&nbsp;&nbsp;{{(servicerequest.reporter.phone) ||'NA'}} </span> </small> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"$parent.total\" ng-model=\"$parent.page\" items-per-page=\"$parent.limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\" style=\"padding-left: 12px\" role=\"group\"> </div> <div class=\"btn-group pull-right\"> <a title=\"Click To Refresh Issues\" ng-click=\"load({ resolvedAt: null, operator: { $ne: null }, resetPage:true, reset:true}, false)\" class=\"btn btn-default btn-xs\"> <i class=\"icon-reload\"></i> </a> <a title=\"Click To Export Issues\" class=\"btn btn-default btn-xs\" ng-csv=\"export\" csv-header=\"['Issue Number','Reported Date','Call Start Time', 'Call End Time','Call Duration(Minutes)', 'Call Duration(Seconds)', 'Reporter Name', 'Reporter Phone', 'Reporter Account', 'Operator', 'Area', 'Service Group', 'Service', 'Assignee', 'Description', 'Address', 'Status', 'Priority', 'Resolved Date', 'Time Taken(days)', 'Time Taken(hrs)', 'Time Taken(mins)', 'Time Taken(secs)']\" filename=\"issues.csv\"> <i class=\"icon-cloud-download\"></i> </a> </div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/servicerequests/_partials/side_subnav.html',
    " <div class=\"row-col bg b-r\"> <div class=\"b-b\"> <div class=\"navbar\"> <ul class=\"nav navbar-nav\"> <li class=\"nav-item\"> <span class=\"navbar-item text-md\"> Issues </span> </li> </ul> </div> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\">Miscellaneous</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ng-class=\"{active:query.$or != null && query.resolvedAt == null}\" class=\"nav-item m-b-xs\"> <a ng-click=\"load({$or:[{operator: party._id},{assignee:party._id}], resolvedAt:null , resetPage:true,reset:true})\" class=\"nav-link text-muted block\" title=\"Issue Received or Assigned To You\"> Inbox </a> </li> <li ng-class=\"{active:query.operator == null && query.$or == null && query.resolvedAt == null}\" class=\"nav-item m-b-xs\"> <a ng-click=\"load({operator:null, resolvedAt:null, resetPage:true,reset:true})\" class=\"nav-link text-muted block\" title=\"Reported Issues Using Other Method Than Call Center\"> Un-Attended </a> </li> <li ng-class=\"{active:query.operator != null && query.resolvedAt == null}\" class=\"nav-item m-b-xs\"> <a ng-click=\"load({resolvedAt:null, operator:{$ne:null}, resetPage:true, reset:true})\" class=\"nav-link text-muted block\" title=\"Reported Issues Currently Not Resolved\"> Un-Resolved </a> </li> <li ng-class=\"{active:query.resolvedAt != null}\" class=\"nav-item m-b-xs\"> <a ng-click=\"load({resolvedAt:{$ne:null}, resetPage:true,reset:true})\" class=\"nav-link text-muted block\" title=\"Reported Issues That Have Been Resolved\"> Resolved </a> </li> </ul> </div> </div> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\">Status</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ng-class=\"{active:query.status == status._id}\" class=\"nav-item m-b-xs\" ng-repeat=\"status in statuses\"> <a ng-click=\"load({'status':status._id, resetPage:true})\" class=\"nav-link text-muted block\"> <span class=\"pull-right text-sm label danger rounded\" style=\"background-color: {{status.color}}\"> {{summaries.statuses[status._id]}} </span>{{status.name}}</a> </li> </ul> </div> </div> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\">Priorities</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ng-class=\"{active:query.priority == priority._id}\" class=\"nav-item m-b-xs\" ng-repeat=\"priority in priorities\"> <a ng-click=\"load({'priority':priority._id, resetPage:true})\" class=\"nav-link text-muted block\"> <span class=\"pull-right text-sm label danger rounded\" style=\"background-color: {{priority.color}}\"> {{summaries.priorities[priority._id]}} </span>{{priority.name}}</a> </li> </ul> </div> </div> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\">Services</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ng-class=\"{active:query.service == service._id}\" class=\"nav-item m-b-xs\" ng-repeat=\"service in services\"> <a ng-click=\"load({service:service._id, resetPage:true})\" class=\"nav-link text-muted block\"> <span class=\"pull-right text-sm label danger rounded\" style=\"background-color: {{service.color}}\"> {{summaries.services[service._id]}} </span> {{service.name}} </a> </li> </ul> </div> </div> <div class=\"p-a-md\"> <div class=\"m-b text-muted text-xs\">Areas</div> <div class=\"nav-active-white\"> <ul class=\"nav\"> <li ng-class=\"{active:query.jurisdiction == jurisdiction._id}\" class=\"nav-item m-b-xs\" ng-repeat=\"jurisdiction in jurisdictions\"> <a ng-click=\"load({'jurisdiction':jurisdiction._id, resetPage:true})\" class=\"nav-link text-muted block\"> <span class=\"pull-right text-sm label danger rounded\" style=\"background-color: {{jurisdiction.color}}\"> {{summaries.jurisdictions[jurisdiction._id]}} </span>{{jurisdiction.name}}</a> </li> </ul> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/create.html',
    " <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"row-col\"> <div ng-include=\"'views/servicerequests/_partials/create.html'\" class=\"col-xs-12 bg servicerequest\" id=\"detail\"></div> </div> </div> </div> "
  );


  $templateCache.put('views/servicerequests/index.html',
    " <div class=\"page-header padding-top-0\" ng-include=\"'views/parties/_partials/header.html'\"> </div> <div class=\"page-content page-content-table\"> <div class=\"page-content-actions padding-left-10\" ng-include=\"'views/parties/_partials/actions.html'\"> </div> <table class=\"table\" data-plugin=\"animateList\" data-animate=\"fade\" data-child=\"tr\" ng-include=\"'views/parties/_partials/parties.html'\"> </table> <uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" align=\"false\"></uib-pager> </div> "
  );


  $templateCache.put('views/servicerequests/main.html',
    " <div class=\"app-body\"> <div class=\"app-body-inner\"> <div class=\"row-col\"> <div ng-include=\"'views/servicerequests/_partials/side_subnav.html'\" class=\"col-xs-3 w modal fade aside aside-md servicerequests-aside\" id=\"subnav\"></div> <div ng-include=\"'views/servicerequests/_partials/list.html'\" class=\"col-xs-3 w-xl modal fade aside aside-sm b-r servicerequests-list\" id=\"list\"></div> <div ng-include=\"'views/servicerequests/_partials/detail.html'\" ng-show=\"!create\" class=\"col-xs-6 bg servicerequest\" id=\"detail\"></div> <div ng-include=\"'views/servicerequests/_partials/create.html'\" ng-show=\"create\" class=\"col-xs-6 bg servicerequest\" id=\"detail\"></div> </div> </div> </div> "
  );


  $templateCache.put('views/services/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Service Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Service\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted\" title=\"Click to edit service\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"save()\" class=\"nav-link text-muted\" title=\"Click to save service\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/services/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/services/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"serviceForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Service Group\"> <div ng-show=\"!edit\" class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"service.group.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"group\" class=\"form-control\"> <label title=\"Group\" class=\"floating-label\">Group</label> </div> <div ng-show=\"edit\" class=\"form-group form-material floating\"> <oi-select oi-options=\"item.name for item in servicegroups track by item.id\" ng-model=\"service.group\" placeholder=\"Select Group\" class=\"form-control\"></oi-select> <label title=\"Group\" class=\"floating-label\">Group</label> </div> </div> <div class=\"m-t-lg\" title=\"Service Code\"> <div class=\"form-group form-material floating\"> <input title=\"Service Code\" ng-disabled=\"!edit\" ng-model=\"service.code\" ng-required ng-minlength=\"1\" type=\"text\" name=\"code\" class=\"form-control\"> <label title=\"Service Code\" class=\"floating-label\">Code</label> </div> </div> <div class=\"m-t-lg\" title=\"Service Name\"> <div class=\"form-group form-material floating\"> <input title=\"Service Name\" ng-disabled=\"!edit\" ng-model=\"service.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> <label title=\"Service Name\" class=\"floating-label\">Name</label> </div> </div> <div class=\"m-t-lg\" title=\"Service Level Agreement\"> <div class=\"form-group form-material floating\"> <input title=\"Service Level Agreement\" ng-disabled=\"!edit\" ng-model=\"service.sla.ttr\" min=\"0\" ng-step=\"1\" type=\"number\" name=\"ttr\" class=\"form-control\"> <label title=\"Service Level Agreement\" class=\"floating-label\">Service Level Agreement</label> </div> </div> <div class=\"m-t-lg\" title=\"Service Color\"> <color-picker ng-model=\"service.color\"> </color-picker> </div> <div class=\"m-t-lg\" title=\"Service Description\"> <div class=\"form-group form-material floating\"> <textarea title=\"Service Description\" ng-disabled=\"!edit\" ng-model=\"service.description\" msd-elastic name=\"about\" class=\"form-control\" rows=\"3\">\n" +
    "                                        </textarea> <label class=\"floating-label\">Description</label> </div> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/services/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Services ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(service)\" class=\"list-item list-item-padded\" ng-repeat=\"service in services\" title=\"{{service.description}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Service Code\" data=\"{{service.code}}\" height=\"60\" width=\"60\" color=\"{{service.color}}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Service Code\" class=\"pull-right text-xs text-muted\"> {{service.code}} </span> <div class=\"item-title\"> <span title=\"Service Name\" class=\"_500\">{{service.name}}</span> </div> <p title=\"Service Description\" class=\"block text-muted text-ellipsis\"> {{service.description}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"> </div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );


  $templateCache.put('views/settings/_partials/settings.html',
    " <div class=\"col-md-12\"> <letter-avatar data=\"{{settings.name}}\" height=\"60\" width=\"60\" shape=\"round\"> </letter-avatar> </div> <div> <form name=\"profileForm\" role=\"form\" autocomplete=\"off\"> <div class=\"col-md-4 margin-top-40\"> <div class=\"form-group form-material floating\"> <input type=\"text\" class=\"form-control\" name=\"name\" ng-model=\"settings.name\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Name</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"text\" class=\"form-control\" name=\"phoneNumber\" ng-model=\"settings.phone\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Phone Number</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"email\" class=\"form-control\" name=\"email\" ng-model=\"settings.email\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Email</label> </div> </div> <div class=\"col-md-4 margin-top-40\"> <div class=\"form-group form-material floating\"> <input type=\"text\" class=\"form-control\" name=\"currency\" ng-model=\"settings.currency\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Currency</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"text\" class=\"form-control\" name=\"dateFormat\" ng-model=\"settings.dateFormat\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Date Format</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"text\" class=\"form-control\" name=\"timeFormat\" ng-model=\"settings.timeFormat\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Time Format</label> </div> <div class=\"form-group form-material floating margin-top-40\"> <input type=\"text\" class=\"form-control\" name=\"defaultPassword\" ng-model=\"settings.defaultPassword\" ng-disabled=\"!edit\" ng-required> <label ng-class=\"{'font-size-14':!edit,'blue-700':!edit, 'font-weight-400':!edit}\" class=\"floating-label\">Default Password</label> </div> </div> </form> </div> "
  );


  $templateCache.put('views/settings/index.html',
    " <div class=\"container settings\"> <div class=\"row\"> <div class=\"col-md-offset-1\"> <div class=\"page-header margin-top-30 padding-left-20\"> <div class=\"page-header-actions\"> <button ng-click=\"onEdit()\" ng-hide=\"edit\" type=\"button\" class=\"btn btn-outline btn-default btn-md empty-btn\" title=\"Click to edit settings\"> <i class=\"icon icon-pencil\" aria-hidden=\"true\"></i> </button> <button ng-click=\"save()\" ng-show=\"edit\" type=\"button\" class=\"btn btn-primary btn-md empty-btn\" title=\"Click to save settings\"> Save </button> <button ng-click=\"onClose()\" ng-show=\"edit\" type=\"button\" class=\"btn btn-outline btn-default btn-md empty-btn\" title=\"Cancel settings edits\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </button> </div> </div> <div class=\"page-content page-content-table margin-top-20\"> <div class=\"container\"> <div class=\"row\"> <div ng-include=\"'views/settings/_partials/settings.html'\"></div> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/statuses/_partials/action_bar.html',
    " <ul class=\"nav navbar-nav\"> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"onCancel()\" class=\"nav-link text-muted\" title=\"Click to Cancel Status Edit\"> <span class=\"nav-text\"> <i class=\"icon ti-close\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onNew()\" class=\"nav-link text-muted\" title=\"Click to Add New Status\"> <span class=\"nav-text\"> <i class=\"icon ti-plus\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"!edit\" class=\"nav-item\"> <a ng-click=\"onEdit()\" class=\"nav-link text-muted\" title=\"Click to edit status\"> <span class=\"nav-text\"> <i class=\"icon-pencil\" aria-hidden=\"true\"></i> </span> </a> </li> <li ng-if=\"edit\" class=\"nav-item\"> <a ng-click=\"save()\" class=\"nav-link text-muted\" title=\"Click to save status\"> Save </a> </li> </ul> "
  );


  $templateCache.put('views/statuses/_partials/detail.html',
    " <div class=\"row-col\"> <div class=\"white b-b bg\"> <div ng-include=\"'views/statuses/_partials/action_bar.html'\" class=\"navbar\"></div> </div> <div class=\"row-row\"> <div class=\"row-body\"> <div class=\"row-inner\"> <div class=\"padding\"> <form ng-submit=\"save()\" name=\"statusForm\" role=\"form\" autocomplete=\"off\" novalidate> <div class=\"box\"> <div class=\"box-body\"> <div class=\"m-b\" title=\"Status Name\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"status.name\" ng-required ng-minlength=\"2\" type=\"text\" name=\"name\" class=\"form-control\"> <label title=\"Status Name\" class=\"floating-label\">Name</label> </div> </div> <div class=\"m-t-lg\" title=\"Status Weight\"> <div class=\"form-group form-material floating\"> <input ng-disabled=\"!edit\" ng-model=\"status.weight\" ng-required type=\"number\" name=\"name\" class=\"form-control\"> <label title=\"Status Weight\" class=\"floating-label\">Weight</label> </div> </div> <div class=\"m-t-lg\" title=\"Status Color\"> <color-picker ng-model=\"status.color\"> </color-picker> </div> </div> </div> </form> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/statuses/_partials/list.html',
    " <div class=\"row-col lt\"> <div class=\"p-a b-b list-search\"> <form> <div class=\"input-group\"> <input type=\"text\" ng-change=\"onSearch()\" ng-model=\"search.q\" class=\"form-control form-control-sm\" placeholder=\"Search Statuses ...\"> <span class=\"input-group-btn\"> <button class=\"btn btn-default btn-sm no-shadow\" type=\"button\"> <i class=\"ti-search\"></i> </button> </span> </div> </form> </div> <div class=\"row-row\"> <div class=\"row-body scrollable hover\"> <div class=\"row-inner\"> <div class=\"list\" data-ui-list=\"info\"> <div ng-click=\"select(status)\" class=\"list-item list-item-padded\" ng-repeat=\"status in statuses\" title=\"{{status.about}}\"> <div class=\"list-left\"> <span class=\"w-40 avatar circle\"> <letter-avatar title=\"Status Visual Color\" data=\"{{status.name}}\" height=\"60\" width=\"60\" color=\"{{status.color}}\" shape=\"round\"> </letter-avatar> </span> </div> <div class=\"list-body\"> <span title=\"Status Weight\" class=\"pull-right text-xs text-muted\"> {{status.weight}} </span> <div class=\"item-title\" title=\"Status Name\"> <span class=\"_500\">{{status.name}}</span> </div> <p title=\"Status Description\" class=\"block text-muted text-ellipsis\"> {{status.name}} </p> </div> </div> </div> </div> </div> </div> <div class=\"p-x-md p-y\"> <div class=\"btn-group pull-right list-pager\" uib-pager ng-show=\"willPaginate()\" total-items=\"total\" ng-model=\"page\" items-per-page=\"limit\" ng-change=\"find()\" template-url=\"views/_partials/list_pager.html\"> </div> <span class=\"text-sm text-muted\">Total: {{total}}</span> </div> </div> "
  );

}]);
