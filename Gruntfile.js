'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  const appConfig = {
    app: 'app',
    appConfig: 'config',
    appSeeds: 'seeds',
    scripts: 'scripts',
    test: 'test'
  };


  // Define the configuration for all the tasks
  grunt.initConfig({
    project: appConfig,

    //------------------------------------------------------------
    //watch task configuration
    //------------------------------------------------------------
    watch: {
      options: {
        livereload: 35739
      },
      express: {
        files: [
          'server.js',
          'worker.js',
          '<%= project.app %>/**/*.*',
          '<%= project.appConfig %>/**/*.*',
          '<%= project.appSeeds %>/**/*.*',
          '<%= project.test %>/**/*.js'
        ],
        tasks: [
          'newer:jshint:all',
          'express:dev'
        ],
        options: {
          spawn: false
        }
      },
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['jshint:gruntfile'],
        options: {
          livereload: false
        }
      },
      all: {
        files: [
          'Gruntfile.js',
          'server.js',
          'worker.js',
          '<%= project.app %>/**/*.js',
          '<%= project.appConfig %>/**/*.js',
          '<%= project.appSeeds %>/**/*.js',
          '<%= project.test %>/**/*.js'
        ],
        tasks: [
          'newer:jshint:all',
          'newer:jshint:test',
          'mochaTest:prototype'
        ],
        options: {
          livereload: false
        }
      },
      test: {
        files: ['<%= project.test %>/**/*.js'],
        tasks: [
          'newer:jshint:all',
          'newer:jshint:test',
          'mochaTest:prototype'
        ],
        options: {
          livereload: false
        }
      }
    },

    //------------------------------------------------------------
    //express server task configuration
    //------------------------------------------------------------
    express: {
      dev: {
        options: {
          script: 'server.js',
          /* jshint ignore:start */
          node_env: 'development'
          /* jshint ignore:end */
        }
      },
      prod: {
        options: {
          script: 'server.js',
          /* jshint ignore:start */
          node_env: 'production'
          /* jshint ignore:end */
        }
      },
      test: {
        options: {
          script: 'server.js',
          /* jshint ignore:start */
          node_env: 'test'
          /* jshint ignore:end */
        }
      }
    },

    //------------------------------------------------------------
    //js hint task configuration
    //------------------------------------------------------------
    // Make sure code styles are up to par and
    // there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: ['Gruntfile.js']
      },
      all: {
        src: [
          'Gruntfile.js',
          'server.js',
          'worker.js',
          '<%= project.app %>/**/*.js',
          '<%= project.appConfig %>/**/*.js',
          '<%= project.appSeeds %>/**/*.js'
        ]
      },
      test: {
        options: {
          jshintrc: '<%= project.test %>/.jshintrc'
        },
        src: ['<%= project.test %>/**/*.js']
      }
    },

    //------------------------------------------------------------
    // mocha test task configuration
    //------------------------------------------------------------
    mochaTest: {
      all: {
        options: {
          reporter: 'spec',
          timeout: 8000
        },
        src: [
          '<%= project.test %>/**/*.js'
        ]
      },
      unit: {
        options: {
          reporter: 'spec',
          timeout: 8000
        },
        src: [
          '<%= project.test %>/unit/**/*.js',
          // 'node_modules/@codetanzania/majifix-jurisdiction/test/unit/**/*.js',
          // 'node_modules/@codetanzania/majifix-account/test/unit/**/*.js',
          'node_modules/@codetanzania/majifix-priority/test/unit/**/*.js',
          'node_modules/@codetanzania/majifix-status/test/unit/**/*.js',
          'node_modules/@codetanzania/majifix-service-group/test/unit/**/*.js'
        ]
      },
      integration: {
        options: {
          reporter: 'spec',
          timeout: 8000
        },
        src: [
          '<%= project.test %>/integration/**/*.js',
          'node_modules/@codetanzania/majifix-jurisdiction/test/integration/**/*.js',
          'node_modules/@codetanzania/majifix-account/test/integration/**/*.js',
          'node_modules/@codetanzania/majifix-priority/test/integration/**/*.js',
          'node_modules/@codetanzania/majifix-status/test/integration/**/*.js',
          'node_modules/@codetanzania/majifix-service-group/test/integration/**/*.js'
        ]
      }
    }

  });

  //run in development environment
  grunt.registerTask('dev', [
    'newer:jshint',
    'express:dev',
    'watch:express'
  ]);

  //run in production environment
  grunt.registerTask('prod', [
    'newer:jshint',
    'express:prod',
    'watch'
  ]);

  //run in test environment
  grunt.registerTask('test', [
    'newer:jshint',
    'mochaTest:all',
    'express:test',
    'watch'
  ]);

  //run all specifications
  grunt.registerTask('spec', [
    'newer:jshint',
    'mochaTest:unit',
    'mochaTest:integration'
  ]);

  //run unit specifications
  grunt.registerTask('unit', [
    'newer:jshint',
    'mochaTest:unit'
  ]);

  //run integration specifications
  grunt.registerTask('integration', [
    'newer:jshint',
    'mochaTest:integration'
  ]);

  //default run jshint and test
  grunt.registerTask('default', [
    'newer:jshint',
    'mochaTest:all',
    'express:dev',
    'watch'
  ]);

};
