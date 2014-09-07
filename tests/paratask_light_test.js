/*
  The purpose of this file is to test how long it'll take for the paratask() method to calculate 4 "light" tasks
*/
(function () {
  'use strict';


  /*Top level error handler*/
  process.on('uncaughtException', function (error) {
    var date = new Date;

    console.log(' ');
    console.log('   Final process Error at '+ date.getTime() +', '+ date.getDate() +'.'+ (date.getMonth()+1) +'.'+ date.getFullYear() +', '+ date.getHours() +':'+ date.getMinutes() +':'+ date.getSeconds() );
    console.log('----------------------------------------------------------------');
    console.log( error.stack );
  });



  var
  paratask = require('../index.js'),

  utils = require('../utils'),
  log   = utils.log;


  var
  task_counter_1 = 1000000000,
  task_counter_2 = 1000000000,
  task_counter_3 = 10,
  task_counter_4 = 10;


  log('');
  log('task_counter_1 =', task_counter_1);
  log('task_counter_2 =', task_counter_2);
  log('task_counter_3 =', task_counter_3);
  log('task_counter_4 =', task_counter_4);
  log('');


  var start_time = new Date().getTime();


  paratask([{
      fork: function (callback) {
        console.log('Task 1 - start');

        while (--task_counter_1);

        console.log('Task 1 - complete');
        callback(null, task_counter_1);
      },

      context: {
        task_counter_1: task_counter_1
      }
    }, {
      fork: function (callback) {
        console.log('Task 2 - start');

        while (--task_counter_2);

        console.log('Task 2 - complete');
        callback(null, task_counter_2);
      },

      context: {
        task_counter_2: task_counter_2
      }
    }, {
      fork: function (callback) {
        console.log('Task 3 - start');

        while (--task_counter_3);

        console.log('Task 3 - complete');
        callback(null, task_counter_3);
      },

      context: {
        task_counter_3: task_counter_3
      }
    }, {
      fork: function (callback) {
        console.log('Task 4 - start');

        while (--task_counter_4);

        console.log('Task 4 - complete');
        callback(null, task_counter_4);
      },

      context: {
        task_counter_4: task_counter_4
      }
    }
  ],

  function (error, results) {
    log('');
    log('--------------------------------');
    log('error         : ', error  );
    log('results       : ', results);
    log('execution time: ', new Date().getTime() - start_time, 'millisecs')
    log('');
  });
})();