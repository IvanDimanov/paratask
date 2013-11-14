'use strict';

module.exports = function (grunt) {

  /*Get the plugin module which will provide Node.js unit testing*/
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  /*Set only the Node.js unit testing module*/
  grunt.initConfig({
    nodeunit: {
      files: ['build_tests/readme_examples_test.js'],
    }
  });
};