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

  /*
    Basic tasks list validation,
    detailed validation of each task will come when iterating over them
  */
  if (!(tasks instanceof Array) ||
      !tasks.length
  ) {
    throw new TypeError('1st argument must be an Array of task objects but was: {'+ typeof tasks +'} '+ utils.toString( tasks ));
  }

  /*Should always have a callback to report to*/
  if (typeof finalCallback === 'undefined') {
    finalCallback = function () {};
  }

  /*Don't start the parallel process if the final notifier was sent but same was not a function*/
  if (typeof finalCallback !== 'function') {
    throw new TypeError('2nd argument, if sent, must be a function but was: {'+ typeof finalCallback +'} '+ utils.toString( finalCallback ));
  }


  var
  results                = [],
  shared_data_file_paths = [],
  child_processes        = [];


  /*Common function for killing any spawn child process and removing any records assign with it*/
  function killProcess(child_process_id) {

    /*Kill the child process*/
    if (child_processes[ child_process_id ]) child_processes[ child_process_id ].kill();

    /*Remove the fork task instructions*/
    if (fs.existsSync( shared_data_file_paths[ child_process_id ] )) fs.unlinkSync( shared_data_file_paths[ child_process_id ] );

    /*Erase the internal record for the child process*/
    if (child_processes[ child_process_id ]) delete child_processes[ child_process_id ];
  }


  /*Stops all currently started processes*/
  function killAllProcesses() {
    utils.each( child_processes, function (child_process, child_process_id) {
      killProcess( child_process_id );
    });
  }


  /*
    Will kill all workers and send so far collected 'results'
    to callee 'finalCallback()' with explanation for the kill as 'error'
  */
  var finishMainProcess = (function () {
    var was_finishe_called = false;

    return function (error) {

      /*Be sure this function will be executed only once*/
      if (was_finishe_called) return;
      was_finishe_called = true;

      finalCallback( error, results );
      killAllProcesses();
    };
  })();


  /*Create a Node process for each task*/
  utils.each( tasks, function (task, task_index) {

    /*Detailed task validation with (hopefully) reasonable errors*/
    var input_error;
    (function () {
      if (typeof task !== 'object' ||
          utils.isEmpty( task )
      ) {
        input_error = 'TypeError: Task with index '+ task_index +' is invalid object: {'+ typeof task +'} '+ utils.toString( task );
        return;
      }

      if (typeof task.fork !== 'function') {
        input_error = 'TypeError: Task with index '+ task_index +' must have "fork" property as a function but was: {'+ typeof task.fork +'} '+ utils.toString( task.fork );
        return;
      }

      if (typeof task.context !== 'undefined' &&
          typeof task.context !== 'object'
      ) {
        input_error = 'TypeError: Task with index '+ task_index +', if sent, "context" property must be of type {object} but was: {'+ typeof task.context +'} '+ utils.toString( task.context );
        return;
      }
    })();

    /*Stop all processes duo to callee input validation error*/
    if (input_error) {
      var _timer = setTimeout(function () {
        finishMainProcess( input_error );
      }, 0);
      return false;
    }


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
      var _timer = setTimeout(function () {
        finishMainProcess( file_error );
      }, 0);
      return false;

    } else {
      child_processes[ child_process_id ].send({shared_data_file_path: shared_data_file_paths[ child_process_id ]});
    }


    /*Wait for any process update of the sent task*/
    child_processes[ child_process_id ].on('message', function (message) {
      if (message.error) {

        /*
          All processes calculations are summed to be connected so
          error in one of them should cancel further work in all
        */
        finishMainProcess( message.error );

      } else {

        /*Keep the work done from the child process and kill it since it's not needed anymore*/
        results[ child_process_id ] = message.result;
        killProcess( child_process_id );
      }
    });


    /*Notify the end-user whenever all of the child processes are been completed (or canceled)*/
    child_processes[ child_process_id ].on('close', function () {

      /*Check if that was the last process we waited to complete*/
      if (!utils.objectLength( child_processes )) {
        finishMainProcess( null );
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


  /*
    Each executed task from incoming 'tasks' have an associated with it Child Process (https://nodejs.org/api/child_process.html)
    Return this array of forked processes so the callee can use their methods like: PID, kill(), etc.
  */
  return child_processes;
}


/*Give external access to the main function*/
module.exports = paratask;