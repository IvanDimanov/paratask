/*
  This file will cover cases where error occur in parallel process 'callback'.
  These errors can be expected (with 1st 'callback' argument) or unexpected (throwing on the process)
*/
'use strict';

var paratask = require('../lib/index.js');


module.exports = {
  'expected callback error': function (test) {

    /*Set the total assertions expected from this test*/
    test.expect(1);

    var task = {
      fork: function (callback) {
        callback('Test error');
      }
    };

    paratask([ task ], function (error, results) {
      test.equal( error, 'Test error', 'Correctly returned callback error');

      /*Mark the test as completed*/
      test.done();
    });
  },


  'unexpected callback error': function (test) {

    /*Set the total assertions expected from this test*/
    test.expect(1);

    var task = {
      fork: function (callback) {
        JSON.parse();
      }
    };

    paratask([ task ], function (error, results) {
      test.equal( error.stack.indexOf('SyntaxError'), 0, '"JSON.parse()" of "undefined" in callback triggers "SyntaxError"');

      /*Mark the test as completed*/
      test.done();
    });
  },


  'unexpected time delayed callback error': function (test) {

    /*Set the total assertions expected from this test*/
    test.expect(1);

    var task = {
      fork: function (callback) {
        setTimeout(function () {
          JSON.parse();
        });
      }
    };

    paratask([ task ], function (error, results) {
      test.equal( error.stack.indexOf('SyntaxError'), 0, '"JSON.parse()" of "undefined" in "setTimeout()" in callback triggers "SyntaxError"');

      /*Mark the test as completed*/
      test.done();
    });
  }
};