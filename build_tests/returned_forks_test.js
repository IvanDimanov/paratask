/*
  This file will test if we can correctly manipulate the returned from 'paratask' array of forks (child processes)
*/
'use strict';

var paratask = require('../lib/index.js');


module.exports = {

  /*
    Each test will be given an array of already forked processes
    so then we can test each of these processes properties,
  */
  setUp: function (callback) {
    var infinite_loop = {
      fork: function (callback) {
        (function infiniteLoop() {
          var _timer = setTimeout(infiniteLoop, 5000);
        })();
      }
    };

    var tasks = [ infinite_loop, infinite_loop, infinite_loop, infinite_loop ];

    this.total_tasks     = tasks.length;
    this.child_processes = paratask( tasks );

    callback();
  },


  /*Be sure we left no process still running*/
  tearDown: function (callback) {
    this.child_processes.forEach(function (child_process) {
      child_process.kill();
    });
    callback();
  },


  'Test if for each fork task there is a respective child process': function (test) {
    test.expect(2);

    test.ok( this.child_processes instanceof Array               , 'There is an array of processes to iterate through');
    test.deepEqual( this.child_processes.length, this.total_tasks, 'The total number of child processes match the total number of requested tasks');

    test.done();
  },


  'Test if all child processes have unique PID properties': function (test) {
    test.expect( this.total_tasks + 1);

    var pids = {};
    this.child_processes.forEach(function (child_process, index) {
      test.deepEqual( typeof child_process.pid, 'number', 'Child process with index='+ index +' have valid {number} pid');

      pids[ child_process.pid ] = true;
    });

    test.deepEqual( Object.keys(pids).length, this.child_processes.length, 'All child processes have unique PIDs');

    test.done();
  },


  'Test if all child process can be correctly killed': function (test) {
    test.expect(5);

    var child_process = this.child_processes[0];

    test.deepEqual( typeof child_process       , 'object'  , 'Child process can be taken out of the global "this.child_processes"');
    test.deepEqual( typeof child_process.kill  , 'function', 'Child process have a valid "kill" function');
    test.deepEqual(        child_process.killed, false     , 'Child process initially is not killed');
    test.deepEqual(        child_process.kill(), true      , 'Child process successfully killed');
    test.deepEqual(        child_process.killed, true      , 'Killed Child process stays killed');

    test.done();
  }
};