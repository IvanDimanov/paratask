/*
  This file is spawned as a separate Node.js process which will
  execute task described with task instructions, exchanged with inter process communication
*/


/*Functions sets used to read and manage task data*/
var
utils = require('./utils'),
fs    = require('fs'),
log   = utils.log;


/*Wait till the parent is ready to send task instructions*/
process.on('message', function (message) {

  /*Extract the instruction file location and the data records from it*/
  var
  shared_data_file_path = message.shared_data_file_path,
  shared_data_string    = fs.readFileSync( shared_data_file_path ),
  shared_data_json      = {};

  /*
    Even if there's no need for specific function context,
    having a valid JSON context description is crucial for the fork function execution
  */
  try {
    shared_data_json = JSON.parse( shared_data_string );
  } catch (error) {
    throw new error;
  }


  /*This process is the only who'll use the data*/
  fs.unlinkSync( shared_data_file_path );


  /*Find the fork function that will be executed, its function body, and the context it depend on*/
  var
  fork_string = shared_data_json.fork_string,
  fork_body   = fork_string.substring( fork_string.indexOf('{')+1, fork_string.lastIndexOf('}')),
  context     = shared_data_json.context;


  /*
    Create an IIFE where we can extend the 'this' global var with all context dependencies needed.
    Please note that the use of 'use strict' will disallow 'this' global var.
  */
  (function () {

    /*Import all context dependencies in the current 'this' context*/
    utils.each( context, function (context_value, context_key) {
      this[ context_key ] = context_value;
    });
 

    /*Find the name of the function that will to be called when the task is completed as a first fork function argument*/
    var
    _1st_comma_index           = fork_string.indexOf(','),
    _1st_opening_bracket_index = fork_string.indexOf('('),
    _1st_closing_bracket_index = fork_string.indexOf(')'),
    closing_arguments_index    = _1st_comma_index > 0 ? Math.min(_1st_comma_index, _1st_closing_bracket_index) : _1st_closing_bracket_index,
    callback_name              = fork_string.substring( _1st_opening_bracket_index+1, closing_arguments_index );
    callback_name              = utils.trim( callback_name );
 
    /*
      In respect to the Node callbacks usage (http://docs.nodejitsu.com/articles/getting-started/control-flow/what-are-callbacks),
      we'll return the possible error state and calculated result to the parent process
    */
    this[ callback_name ] = function (error, result) {
      process.send({
        error : error, 
        result: result
       });
    };
 
    /*Execute the task body function in the updated context of 'this'*/
    eval( fork_body );
  })();
});