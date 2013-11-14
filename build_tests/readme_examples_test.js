/*
  This file will test if all of the example usages of the 'paratask' module mentioned in the 'readme.md' are correct
*/
'use strict';

var paratask = require('../index.js');

module.exports = {
  'Test the 1st example from the "readme.md"': function (test) {

    /*Set the assertions needed to check the error state and tasks' results*/
    test.expect(4);

    /*Follow the 1st example from the 'readme.md'*/

    var task_1 = {
      fork: function (callback) {
        // Some calculation using the 'count' context var
        var result = count * 10;
        callback(null, result);
      },
      context: {
        count: 10
      }
    };

    var task_2 = {
      fork: function (callback) {
        // Some calculation using the 'count' context var
        var result = count * 10;
        callback(null, result);
      },
      context: {
        count: 20
      }
    };

    paratask([ task_1, task_2 ], function (error, results) {

      /*Verify task performance*/
      test.equal( error         , null, 'No errors should occur during this test');
      test.equal( results.length,    2, 'There should be exactly 2 task results');
      test.equal( results[0]    ,  100, '1st result should be ten times greater than "task_1.context.count"');
      test.equal( results[1]    ,  200, '2nd result should be ten times greater than "task_2.context.count"');

      /*Mark the test as completed*/
      test.done();
    });
  },


  'Test the 2nd example from the "readme.md"': function (test) {

    /*Set the assertions needed to check the error state*/
    test.expect(1);

    /*Follow the 2nd example from the 'readme.md'*/

    var task_1 = {
      fork: function (callback) {
        var
        count     = 100000,
        factorial = 1;

        while (--count) factorial *= count;

        callback(null, factorial);
      }
    };

    var task_2 = {
      fork: function (callback) {
        callback('Error message');
      }
    };

    paratask([ task_1, task_2 ], function (error, results) {

      /*Verify task performance*/
      test.equal( error, 'Error message', 'The incoming error should be exactly the same as the one we executed in "task_2"');

      /*Mark the test as completed*/
      test.done();
    });
  }
};