# Paratask - Node.js/io.js Parallel Tasks Manager
[![Build Status](https://secure.travis-ci.org/IvanDimanov/paratask.png?branch=master)](http://travis-ci.org/IvanDimanov/paratask)
[![NPM version](https://badge.fury.io/js/paratask.png)](http://badge.fury.io/js/paratask)

Paratask is a tool that will execute your back-end JavaScript code in __parallel__ using the full potential of multi-process programming.
In contrast to asynchronous task management, Paratask will create a child Node.js/io.js process in which your task will 'live'.

__Warning:__ This means that your task function will be able to get only a non-functional context dependencies. More into in the examples below.


## Install
You can install Paratask with the Node Package Manager:
```shell
npm install paratask
```
or by getting it from [this repo](https://github.com/IvanDimanov/paratask).

## Dependencies
Paratask uses only native Node.js/io.js modules that do not need additional installation: `fs` and `child_process`.


## Examples
Both `task_1` and `task_2` will fork a Node.js process,
execute their functions and when both call `callback()`,
the final error state and results will be printed in the console.

__Warning:__ `context` property can only be a valid `JSON.parse()` value (i.e. no functions allowed).

```javascript
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
  console.log( results );  // [100, 200], 1st task result will be always the 1st in the results array even if completed last
});
```


Both `task_1` and `task_2` will fork a Node.js process but
from the moment when `task_2` call `callback('Error message')`
both processes will be killed and the final callback will be executed,
printing the 1st occurred error and the results array in the moment of error occurrence.

__Note:__ `context` property is optional.

```javascript
var paratask = require('paratask');

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
  console.log( error   );  // 'Error message'
  console.log( results );  // [], the results array may not have any data saved since one task error will kill all forked tasks
});
```


## Comparison tests
A palette of comparison tests between `paratask()`, `async.parallel()`, and `process.nextTick()` are available in `./tests` folder.

### Heavy calculation test:

```shell
node tests/async_heavy_test.js
```
```shell
node tests/process_nextTick_heavy_test.js
```
```shell
node tests/paratask_heavy_test.js
```


## Conclusion
Paratask is great when you have several time consuming task functions with few external dependencies.
In such cases, multi-processing is the best approach.
When you want to manage several relevantly quick functions with asynchronous logic, [async](https://github.com/caolan/async) will handle it with beauty.