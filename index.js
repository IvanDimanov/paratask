var
/*Node.js file that will be spawn with different task instructions every time when new Node process is needed*/
TASK_EXECUTOR_FILE_PATH = __dirname +'/task_executor.js',

/*Folder location from which JSON file task instructions will be exchanged between the parent and child processes*/
SHARED_DATA_FOLDER_PATH = __dirname +'/shared_data/';


var
/*Handful set of functions*/
utils = require('./utils'),
fs    = require('fs'),
log   = utils.log,

/*Used to 'spawn' new Node processes*/
child_process_module = require('child_process');


/*
  This is the function that will be exported to send to 'module.exports'.
  Its purpose is to create a child process for each task in the tasks list and
  call the finalCallback function when all tasks are completed.

  Each task need to have have properties as
    fork    - function with single argument (callback) that the task need to execute with possible error state and result when completed
    context - JSON dependencies used from the fork() property function, please note that functions cannot be included in the 'context' property

  finalCallback will be executed when all tasks are completed with 1st argument - a possible error and 2nd argument - an array of all task results.

  Example:
    var paratask = require('paratask');

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
      console.log( error   );  // null
      console.log( results );  // [100, 200], 1st task result will be always the 1st in the results array even if complete last
    });
*/
function paratask(tasks, finalCallback) {
  var
  error                   = null,
  results                 = [],
  shared_data_file_paths  = [],
  child_processes         = [],
  total_uncompleted_tasks = utils.objectLength( tasks );


  /*Common function for killing any spawn child process and removing any records assign with it*/
  function killProcess(child_process_id) {

    /*Kill the child process*/
    if (child_processes[ child_process_id ]) child_processes[ child_process_id ].kill();

    /*Remove the fork task instructions*/
    if (fs.existsSync( shared_data_file_paths[ child_process_id ] )) fs.unlinkSync( shared_data_file_paths[ child_process_id ] );

    /*Erase the internal record for the child process*/
    delete child_processes[ child_process_id ];
  }


  /*Create a Node process for each task*/
  utils.each( tasks, function (task) {

    /*Create a child Node process and keep its instance*/
    var child_process_id = child_processes.length;
    child_processes.push( child_process_module.fork( TASK_EXECUTOR_FILE_PATH ) );


    /*TODO: Inter process communication with '.send()'' is limited to short messages, hence,
            sending long functions or large amount of 'context' dependencies will
            either be concatenated before sending, or the communication will fail duo time limit.
            A workaround is to save all data as JSON in a file (file name ~ 'child_process_id') and
            send only the file name so the 'child' process could JSON.parse() the data for itself.
            The huge challenge is to create a "global context namespace" where the 'fork()'
            will "live" with all of its 'context' dependencies (external for 'fork()' functions and variables).
    */
    shared_data_file_paths[ child_process_id ] = SHARED_DATA_FOLDER_PATH + new Date().getTime() +'_'+ child_process_id +'_'+ Math.random() +'.json';
    var shared_data_json = {
      fork_string: task.fork.toString(),
      context    : task.context
    };

    /*Send the instructions only if all are been correctly recorded*/
    var file_error = fs.writeFileSync( shared_data_file_paths[ child_process_id ], JSON.stringify( shared_data_json ));
    if (file_error) {
      child_processes[ child_process_id ].kill();
      throw new file_error;
    } else {
      child_processes[ child_process_id ].send({shared_data_file_path: shared_data_file_paths[ child_process_id ]});
    }


    /*Wait for any process update of the sent task*/
    child_processes[ child_process_id ].on('message', function (message) {
      if (message.error) {

        /*
          All processes calculations are summed to be connected so
          error in one of them should cancel further work in the reset
        */
        error = message.error;
        utils.each( child_processes, function (child_process, child_process_id) {
          killProcess( child_process_id );
        });

      } else {

        /*Keep the work done from the child process and kill it since it's not needed anymore*/
        results[ child_process_id ] = message.result;
        killProcess( child_process_id );
      }
    });


    /*Notify the end-user whenever all of the child processes are been completed (or canceled)*/
    child_processes[ child_process_id ].on('close', function () {
      if (!--total_uncompleted_tasks) {
        finalCallback( error, results );
      }
    });


    /*Clear process settings in all cases*/
    child_processes[ child_process_id ].on('disconnect', function () {
      killProcess( child_process_id );
    });
    child_processes[ child_process_id ].on('exit', function () {
      killProcess( child_process_id );
    });
  });
}


/*Give external access to the main function*/
module.exports = paratask;