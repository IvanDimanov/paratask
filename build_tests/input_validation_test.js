/*
  This file will cover the basic error cases of calling "paratask()" with wrong arguments
*/
'use strict';

var paratask = require('../lib/index.js');


module.exports = {
  'calling "paratask()" with wrong 1st argument: tasks array list': function (test) {

    /*Set the total assertions expected from this test*/
    test.expect(3);

    try {
      paratask();
    } catch (error) {
      test.equal( error.stack.indexOf('TypeError'), 0, 'Empty call triggers a "TypeError"');
    }

    try {
      paratask({});
    } catch (error) {
      test.equal( error.stack.indexOf('TypeError'), 0, 'Called with empty object {} triggers a "TypeError"');
    }

    try {
      paratask([]);
    } catch (error) {
      test.equal( error.stack.indexOf('TypeError'), 0, 'Called with empty array [] triggers a "TypeError"');
    }

    /*Mark the test as completed*/
    test.done();
  },


  'calling "paratask()" with empty string task': function (test) {

    /*Set the total assertions expected from this test*/
    test.expect(1);

    paratask([''], function (error, results) {
      test.equal( error.stack.indexOf('TypeError'), 0, 'Called with task as empty string "" returns a "TypeError"');

      /*Mark the test as completed*/
      test.done();
    });
  },


  'calling "paratask()" with empty object task': function (test) {

    /*Set the total assertions expected from this test*/
    test.expect(1);

    paratask([{}], function (error, results) {
      test.equal( error.stack.indexOf('TypeError'), 0, 'Called with task as empty object {} returns a "TypeError"');

      /*Mark the test as completed*/
      test.done();
    });
  },


  'calling "paratask()" with missing "fork" function': function (test) {

    /*Set the total assertions expected from this test*/
    test.expect(1);

    var task = {
      scope: {}
    };

    paratask([ task ], function (error, results) {
      test.equal( error.stack.indexOf('TypeError'), 0, 'Called with missing "fork" function returns a "TypeError"');

      /*Mark the test as completed*/
      test.done();
    });
  },


  'calling "paratask()" with invalid "fork" function': function (test) {

    /*Set the total assertions expected from this test*/
    test.expect(1);

    var task = {
      fork: '',
      scope: {}
    };

    paratask([ task ], function (error, results) {
      test.equal( error.stack.indexOf('TypeError'), 0, 'Called with invalid "fork" function returns a "TypeError"');

      /*Mark the test as completed*/
      test.done();
    });
  },


  'calling "paratask()" with invalid "scope" function': function (test) {

    /*Set the total assertions expected from this test*/
    test.expect(1);

    var task = {
      fork: function (callback) {
        callback();
      },
      scope: ''
    };

    paratask([ task ], function (error, results) {
      test.equal( error.stack.indexOf('TypeError'), 0, 'Called with invalid "scope" function returns a "TypeError"');

      /*Mark the test as completed*/
      test.done();
    });
  }
};