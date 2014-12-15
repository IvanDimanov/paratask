/*
  This file is spawned as a separate Node.js process which will
  execute task described with task instructions, exchanged with inter process communication
*/

/*Used to execute the task in error controlled environment*/
var domain = require('domain').create();

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

  /*This process is the only who'll use the data*/
  fs.unlinkSync( shared_data_file_path );


  /*
    Even if there's no need for specific function context,
    having a valid JSON context description is crucial for the fork function execution
  */
  try {
    shared_data_json = JSON.parse( shared_data_string );
  } catch (error) {
    process.send({
      error: 'Unable to execute "JSON.parse()" over file content "'+ message.shared_data_file_path +'": '+ error
    });
    return;
  }


  /*Find the fork function that will be executed, its function body, and the context it depend on*/
  var
  fork_string = shared_data_json.fork_string,
  fork_body   = fork_string.substring( fork_string.indexOf('{')+1, fork_string.lastIndexOf('}')),
  context     = shared_data_json.context;


  /*Find the name of the function that will to be called when the task is completed as a first and only fork function argument*/
  var
  _1st_opening_bracket_index = fork_string.indexOf('('),
  _1st_closing_bracket_index = fork_string.indexOf(')'),
  callback_name              = fork_string.substring( _1st_opening_bracket_index+1, _1st_closing_bracket_index );
  callback_name              = utils.trim( callback_name );

  /*Secure a function that we can send the final result to*/
  if (
    !callback_name.length       ||
    ~callback_name.indexOf(' ') ||
    ~callback_name.indexOf(',')
  ) {
    process.send({
      error: 'Fork function below must have a "callback" variable as its only argument:\n'+ fork_string
    });
    return;
  }


  /*
    The logic below will set all 'context' arguments in 2 list,
    where the 1st list is a {string} with all of the arguments' names,
    and the 2nd list is an {array} of all arguments' values.
    The point of this is later they to be used as new arguments on the Fork function
    so the same function can use them freely in its body
  */
  var fork_arguments_names  = '';
  var fork_arguments_values = [];
  (function () {

    /*All all dependencies mentioned in 'context'*/
    utils.each( context, function (value, name) {
      fork_arguments_names += name +', ';
      fork_arguments_values.push( value );
    });

    /*Set mandatory "callback" function as last argument*/
    fork_arguments_names += callback_name;
    fork_arguments_values.push(function (error, result) {
      process.send({
        error : error,
        result: result
       });
    });
  })();


  /*Populate any unexpected execution error back to the manager process*/
  domain.on('error', function (error) {
    process.send({
      error: error.stack
    });
  });

  /*
    Execute the Fork body function
    with all of its 'context' variables as newly added arguments
    in a new error controlled environment
  */
  domain.run(function () {

    // console.log('111111111');

    new Function( fork_arguments_names, fork_body ).apply( null, fork_arguments_values );
  });
});