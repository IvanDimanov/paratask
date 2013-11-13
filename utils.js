/**
 * Common set of general purpose JS functions.
 * They will be directly exported if 'module.exports' is been provided as Node.js or
 * will 
 */
 (function () {
    'use strict';


    /*Short-hand debug function*/
    function log() {
        console.log.apply( console, arguments );
    }


    /*Remove spaces from both string ends*/
    function trim(str) {
        return str.replace(/^\s+|\s+$/g, '');
    }


    /**
     * Takes a string of words and removes all white spaces between, before and after the words,
     * 
     * @param  {String} str Presumably long string of words
     * @return {String}     Same as the income str but trimmed + with no long white spaces between each word
     *
     * @example
     *   normalize('   x x    x x') => "x x x x"
     *   normalize('x x')           => "x x"
     */
    function normalize(str) {
        return ( (str + '').match(/\S+/g) || [] ).join(' ');
    }


    /**
     * Convert any JS data type to secured {String} type
     * NOTE: 'toString()' is a received function for some browsers
     * 
     * @param  {Mixed}  message  Any type of var that need a String convert
     * @return {String}          Secured String format or an empty string ('')
     */
    function toString(message) {
        switch (typeof message) {
            case 'string':
                return message;
            break;

            case 'number':
                return message +'';
            break;

            case 'object':
                return JSON.stringify( message );
            break;

            default:
                return '';
            break;
        }
    }


    /**
     * Check if the income var is a real number (integer, octal, or float).
     * 
     * @param  {Mixed}   number  The variable that need to be checked if it's a number var
     * @return {Boolean}         Return a true if the income var is a number (else false)
     */
    function isNumber(number) {
      return !isNaN( parseFloat(number) ) && isFinite(number);
    }


    /**
     * Check if the incoming 'int' is an Integer number
     * 
     * @dependences
     *     isNumber()
     */
    function isInteger(int) {
        return isNumber(int) && !(int % 1);
    }


    /**
     * Extend an integer number by adding '0' in front.
     * 
     * @author Ivan Dimanov
     * @param  n      An integer number to be extended
     * @param  digits Total number of final digits
     * 
     * @depends
     *     isNumber()
     * 
     * @example
     *   setDigits(7   , 3)    => '007'
     *   setDigits('7' , 3)    => '007'
     *   setDigits('70', 3)    => '070'
     *   setDigits('a7', 3)    => 'a7'
     *   setDigits(7   , 'a3') => 7
     * 
     */
    function setDigits(n, digets) {
        digets  *= 1;
        var diff = digets - (n + '').length;

        if (isNumber(n) && isNumber(digets) && diff > 0) {
            while (diff--) n = '0' + n;
        }

        return n;
    }


    /**
     * Set an incoming number between 2 number values
     * 
     * @param  {Number}  num      The number we want to get in between
     * @param  {Number}  limit_1  1st number limit
     * @param  {Number}  limit_2  2nd number limit
     * @return {Number}           Clamped number or if any errors occurred, the same incoming num
     */
    function clampNumber(num, limit_1, limit_2) {

        /*Echo the incoming test number if no valid input is been provided*/
        if (
            !isNumber( num )     ||
            !isNumber( limit_1 ) ||
            !isNumber( limit_2 )
        ) return num;

        var
        /*Take maximum and minimum values from the incoming limits*/
        clamped = num,
        max     = Math.max(limit_1, limit_2),
        min     = Math.min(limit_1, limit_2);

        /*Clamp the incoming number between its value limits*/
        if (num > max) clamped = max;
        if (num < min) clamped = min;

        return clamped;
    }


    /**
     * Takes any Real number and tries to round it till the new point position.
     * @example
     *     roundAfterPoint( 7.119511 ,  3 )  =>  7.12
     *     roundAfterPoint( 7.119411 ,  3 )  =>  7.119
     *     roundAfterPoint('7.119411',  3 )  =>  7.119
     *     roundAfterPoint( 7.119411 , '3')  =>  7.119
     *     roundAfterPoint('a.119411',  3 )  =>  'a.119411'
     *     roundAfterPoint( 7.119411 , -3 )  =>  7.119411
     *     roundAfterPoint( 7.119411 , 'a')  =>  7.119411
     */
    function roundAfterPoint(_number, _precession) {
        var
        number     = _number *1,
        precession = _precession *1;

        /*Validate number input*/
        if (isNaN(number)     || !number       ) return _number;
        if (isNaN(precession) || precession < 0) return _number;

        /*Calculate the exact position from where we should make a round*/
        var precession_coeff = 1;
        while (precession--) precession_coeff *= 10;

        return Math.round( number *precession_coeff ) /precession_coeff;
    }


    /**
     * Always return an Array with a structure as maximum as close to the incoming obj structure
     */
    function toArray(obj) {
        switch(typeof obj) {
            case 'string':
            case 'number':
                return [obj];
            break;

            case 'object':
                return obj instanceof Array ? obj : [];
            break;

            default:
                return [];
            break;
        }
    }


    /*Gives the total number of private object keys*/
    var objectLength = function (obj) {

        /*Input validation*/
        if (typeof obj != 'object') return 0;
        var length = 0;

        /*Count only private Object keys*/
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) length++;
        }

        return length;
    };


    /**
     * Reduce the income string to a limit of chars
     * Examples:
     *    clampString('abcdefg',  1)  => "."
     *    clampString('abcdefg',  4)  => "a..."
     *    clampString('abcdefg',  7)  => "abcdefg"
     *    clampString('abcdefg', 20)  => "abcdefg"
     *    clampString('abcdefg', -1)  => "abcdefg"
     *    clampString('abcdefg', 'a') => "abcdefg"
     */
    function clampString(str, limit) {
        var clamped = '';

        /*Validate input*/
        if (typeof str != 'string') return str;
        if (!isInteger(limit)     ) return str;


        /*Check for valid char limits*/
        if (limit > 0 && str.length > limit) {

            /*Char symbols that will represent that the string is been clamped*/
            var
            end_chars        = '...',
            end_chars_length = end_chars.length;

            /*Check if our char presenters are in the maximum chars limit*/
            if (end_chars_length < limit) {

                /*Returned a part from the main income string and ending representative chars*/
                clamped = str.substr(0, limit - end_chars_length) + end_chars;
            } else {
              
                /*Return a portion of our representative chars*/
                clamped = end_chars.substr(0, limit);
            }

        } else {

            /*Return the same string if invalid limit chars is specified*/
            clamped = str;
        }

        /*Return the clamped formated string*/
        return clamped;
    }


    /**
     * Common function to iterate through an Array or Object elements.
     * If the callback function return false all iteration will be stopped.
     * 
     * @param  {Object}    obj       JSON object or an array which we can use for iteration
     * @param  {Function}  callback  The notification function which will be sent pairs of data from the incoming obj
     * @return {Boolean}             Tells if there were a looping or not
     */
    /*NOTE: It is important to remember that looping using this function will not brake "the sync model of events"
            since we have not used any async function to paralle the loop
    */
    function each(obj, callback) {

        /*Immediately exit from the function if any of the mandatory arguments is missing*/
        if (typeof callback != 'function') return false;
        if (typeof obj      != 'object'  ) return false;


        /*Determine an Array or an Object*/
        if (obj instanceof Array) {

            /*Cache common loop elements*/
            var
            i       = 0,
            length  = obj.length,
            element = obj[i];
         
            /*Go through all Array elements and send them back to the callback function as an index - element pair*/
            for (; i < length; element = obj[i]) {

                /*Exit from the loop if the callback explicitly ask for it*/
                if (callback(element, i++, obj) === false) break;
            }

        } else {

            /*Go through all Object key - value pairs and send them 1 by 1 to the callback function*/
            for (var key in obj) {

                /*
                    Send only 'own properties' and
                    exit from the loop if the callback explicitly ask for it
                */
                if (obj.hasOwnProperty(key)) if (callback( obj[key], key, obj ) === false) break;
            }
        }

        /*Gives a positive reaction if when all looping is completed*/
        return true;
    }



    /**
     * Recursive function that will create a variable clone of any type: Object, Function or Primitive types
     * NOTE: _.clone() does not create a function clone
     * 
     * @dependences
     *     each()
     */
    var clone = (function () {

        /*Return a clone of a function*/
        function cloneFunction(func) {
          return function () {
            return func.apply(this, arguments);
          };
        }


        return function (variable) {

            /*Since this function is recursive, it's important to recreate the cloned variable on every call*/
            var cloned_var = {};
          
            /*Determine income variable type*/
            if (typeof variable == 'object') {

                /*Check if we need to recreate an Array or an Object*/
                if (variable instanceof Array) {
                    cloned_var = variable.slice(0);

                } else {
                    cloned_var = {};

                    /*Go through each variable key - value pairs and recursively clone them*/
                    each(variable, function (value, key) {
                        cloned_var[key] = clone(value);
                    });
                }

            } else if (typeof variable == 'function') {

                /*Use the internal function to clone a function variable*/
                cloned_var = cloneFunction(variable);
            } else {

                /*Just copy the variable since it's from a primitive type*/
                cloned_var = variable;
            }

            return cloned_var;
        };
    })();


    /**
     * Use a common formated string and an optional Date object to produce more user-friendly date string
     *
     * @dependences
     *     isInteger()
     *     setDigits()
     * 
     * @param  {string}    format    Used to replace each date token with a predefined date string
     * @param  {timestamp} timestamp Optional timestamp to be used as a template. If not specified, will use the current date timestamp
     * @return {string}    Final     'humanized' date string with all available tokens included
     *
     * @examples
     *     formatDate()                            => '11:21:05 27.03.2013'
     *     formatDate('ddd MM.YYYY')               => 'Wed 03.2013'
     *     formatDate('hh:mm:ss a', 1000000000000) => '04:46:40 am'
     */
    var formatDate = (function () {
        var
        month_day    = -1,
        week_day     = -1,
        SHORT_MONTHS = ['Jan'    , 'Feb'     , 'Mar'  , 'Apr'  , 'May', 'Jun' , 'Jul' , 'Aug'   , 'Sep'      , 'Oct'    , 'Nov'     , 'Dec'],
        LONG_MONTHS  = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        month      = -1,
        SHORT_DAYS = ['Sun'   , 'Mon'   , 'Tue'    , 'Wed'      , 'Thu'     , 'Fri'   , 'Sat'],
        LONG_DAYS  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

        hours   = -1,
        minutes = -1,
        seconds = -1,
        am_pm   = '';


        return function (format, timestamp) {

            /*Set default values*/
            format    = format    ? format    : 'HH:mm:ss DD.MM.YYYY';
            timestamp = timestamp ? timestamp : new Date().getTime();

            /*Validate input*/
            if (typeof format != 'string') throw new Error('If specified, 1st argument must be a {sting} but you sent {'           + typeof format    +'} '+ format);
            if (!isInteger(timestamp))     throw new Error('If specified, 2nd argument must be a {timestamp} object but you sent {'+ typeof timestamp +'} '+ timestamp);

            /*Convert validated timestamp into a JS Date object*/
            var date = new Date( timestamp );

            /*Replace Year tokens*/
            format = format.replace(/YYYY/g, date.getFullYear());
            format = format.replace(/YY/g  , date.getFullYear() % 100);

            /*Replace Day of the Month tokens*/
            month_day = date.getDate();
            format    = format.replace(/DD/g, setDigits(month_day, 2));
            format    = format.replace(/D/g , month_day);

            /*Replace Hour tokens*/
            hours  = date.getHours();
            format = format.replace(/HH/g, setDigits(hours, 2));
            format = format.replace(/H/g , hours);
            format = format.replace(/hh/g, setDigits(hours % 12, 2));
            format = format.replace(/h/g , hours % 12);

            /*Replace Minutes tokens*/
            minutes = date.getMinutes();
            format  = format.replace(/mm/g, setDigits(minutes, 2));
            format  = format.replace(/m/g , minutes);

            /*Replace AM/PM tokens*/
            am_pm  = hours < 12 ? 'am' : 'pm';
            format = format.replace(/a/g, am_pm);
            format = format.replace(/A/g, am_pm.toUpperCase());

            /*Replace Seconds tokens*/
            seconds = date.getSeconds();
            format  = format.replace(/ss/g, setDigits(seconds, 2));
            format  = format.replace(/s/g , seconds);

            /*Replace Month tokens*/
            month  = date.getMonth();
            format = format.replace(/MMMM/g   , LONG_MONTHS[month]);
            format = format.replace(/MMM/g    , SHORT_MONTHS[month]);
            format = format.replace(/MM/g     , setDigits(month+1, 2));
            format = format.replace(/M([^a])/g, month+1 +'$1');   /*Prevent replacing 'M' in 'May'*/

            /*Replace Day of the Week tokens*/
            week_day = date.getDay();
            format   = format.replace(/dddd/g, LONG_DAYS[week_day]);
            format   = format.replace(/ddd/g , SHORT_DAYS[week_day]);
     

            /*Returns the pre formated date/time incoming string*/
            return format;
        };
    })();


    /**
     * Convert a timestamp to game time with a maximum scope of minutes, e.g. '0:01', '6:00', '+6:10', '-16:20'
     * 
     * @dependences
     *     isNumber()
     *     setDigits()
     * 
     * @param  {Timestamp} timestamp      Unix timestamp [milliseconds] that need to be converted
     * @param  {Boolean}   show_plus_sign Indicates whenever we need to show a '+' sign in front of the final time if the timestamp is positive
     * 
     * @return {String}    Final string form of the timestamp
     *
     * @examples
     *   minutesLimitedTime()                                     => '0:00'
     *   minutesLimitedTime( - (4 * 60 * 1000 + 7 * 1000) )       => '-4:07'
     *   minutesLimitedTime(   (4 * 60 * 1000 + 7 * 1000) )       => '4:07'
     *   minutesLimitedTime(   (4 * 60 * 1000 + 7 * 1000), true ) => '+4:07'
     */
    var minutesLimitedTime = (function () {
        var
        total_seconds = 0,
        sign          = '',
        math_function = '',
        minutes       = 0,
        seconds       = 0;

        return function (timestamp, show_plus_sign) {

            /*Secure function parameters*/
            total_seconds  = isNumber(timestamp) ? Math.round(timestamp / 1000) : 0;
            show_plus_sign = show_plus_sign == true;

            /*Check if we need to add the '+' sign in front of the final string result*/
            sign          = total_seconds < 0 ? '-' : (show_plus_sign ? '+' : '');
            total_seconds = Math.abs(total_seconds);

            /*Check which Math function we'll need for rounding calculation*/
            math_function = total_seconds < 0 ? 'ceil' : 'floor';

            /*Calculate the total amount of hours, minutes and seconds*/
            minutes = Math[ math_function ]( total_seconds / 60);
            seconds = Math[ math_function ]( total_seconds - minutes * 60);

            /*Return a final formated time string*/
            return sign + minutes +':'+ setDigits(seconds, 2);
        }
    })();


    /*
        Converts the incoming Unix timestamp [milliseconds] in more "human" formated string.
        When show_plus_sign is set to true we'll show a '+' in front if the timestamp is a > 0.
    */
    var hoursLimitedTime = (function () {
        var
        total_seconds = 0,
        sign          = '',
        math_function = '',
        hours         = 0,
        minutes       = 0,
        seconds       = 0;

        return function (timestamp, show_plus_sign, extend_over_24_hours) {

            /*Secure function parameters*/
            total_seconds  = isNumber(timestamp) ? Math.round(timestamp / 1000) : 0;
            show_plus_sign = show_plus_sign == true;

            /*Check if we need to add the '+' sign in front of the final string result*/
            sign          = total_seconds < 0 ? '-' : (show_plus_sign ? '+' : '');
            total_seconds = Math.abs(total_seconds);

            /*Tells if we need to clamp the hours to the last 24*/
            if (!extend_over_24_hours) total_seconds %= 24 * 60 * 60;

            /*Check which Math function we'll need for rounding calculation*/
            math_function = total_seconds < 0 ? 'ceil' : 'floor';

            /*Calculate the total amount of hours, minutes and seconds*/
            hours   = Math[ math_function ]( total_seconds / 60 / 60);
            minutes = Math[ math_function ]( total_seconds / 60 - hours * 60);
            seconds = Math[ math_function ]( total_seconds - minutes * 60 - hours * 60 * 60);

            /*Return a final formated time string*/
            return sign + setDigits(hours, 2) +':'+ setDigits(minutes, 2) +':'+ setDigits(seconds, 2);
        }
    })();


    /**
     * Set of utilities to present Client/Browser timezone difference from UTC/GMT
     * 
     * @dependences
     *     setDigits()
     * 
     * @return  {Object}  List of all client Timezone properties generated
     */
    var timezone = (function () {
        var
        client_date        = new Date(),
        offset             = client_date.getTimezoneOffset(),
        hours              = Math.floor(offset / 60),
        minutes            = Math.abs(  offset % 60),
        abbreviation_match = client_date.toString().match(/\(([^)]+)\)$/);

        /*NOTE: We invert the hours here because getTimezoneOffset() returns time difference between UTC and local time in [minutes], not vise versa
                https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
                http://msdn.microsoft.com/en-us/library/ie/014ykh71(v=vs.94).aspx
        */
        hours = -hours;

        return {
            minutes     : offset,                                                                /*[minutes]*/
            timestamp   : offset * 60 * 1000,                                                    /*[milliseconds]*/
            label       : 'GMT '+ (-offset > 0 ? '+' : '') + hours +':'+ setDigits(minutes, 2),  /*UI presentation*/
            abbreviation: abbreviation_match ? abbreviation_match[1] : ''                        /*Common description timezone text, e.g. "UTC", "CET", "CEST"*/
        };
    })();


    /**
     * Returns a helpful set of properties regarding a given 'date' (Date instance).
     * If 'date' is not given the current User Date is been used.
     * 
     * @param  {Date} date  Optional Date instance used to determine the DST properties of
     * @return {JSON}       List of helpers telling more about the User timezone. More explanation is given in the 'return' method.
     */
    function daylightSavingTime(date) {

        if (!(date instanceof Date)) date = new Date();

        var
        /*Stores the current or predefined Client Date moment*/
        current_year = date.getFullYear(),

        /*Secure a Winder date with no DST set and Summer date where DTS can be set if available for the current User timezone*/
        january_1st = new Date(current_year, 0, 1),
        june_1st    = new Date(current_year, 5, 1),

        can_be_set = january_1st.getTimezoneOffset() != june_1st.getTimezoneOffset(),

        abbreviation_match = date.toString().match(/\(([^)]+)\)$/);


        return {

            /*Tells if DTS is in use for the current User timezone*/
            can_be_set: can_be_set,

            /*Tells if DST is currently been added*/
            is_set: can_be_set && date.getTimezoneOffset() == june_1st.getTimezoneOffset(),

            /*Gives the DTS timezone abbreviation when DTS is set e.g. 'CEST', 'EEST', 'AEST'*/
            type: can_be_set ? (abbreviation_match ? abbreviation_match[1] : '') : ''
        };
    }



    /**
     * Used in the way of Underscore _.bind() function
     * 
     * @param  {Function}  fn     Function to be called in the sent scope
     * @param  {Object}    scope  Object scope that will execute the incoming function
     */
    function bind(func, context) {
        return function () {
            return func.apply(context, arguments);
        };
    }



    /**
     * Duplicates the behavior of the _.extend() function.
     * If the 1st argument is an source object
     * the function will use all the reset given objects to clone all their properties into the 1st object source.
     * Overriding is allowed by the rule of "later object overrides the former".
     * 
     * @dependences
     *     each()
     */
    var extend = (function () {
        var
        args   = [],
        source = null;


        return function () {

            /*Convert to Array for better handling */
            args = Array.prototype.slice.call( arguments );

            /*Validate source object*/
            source = args.shift();
            if (typeof source != 'object' && source != null) throw new Error('1st argument must be a source {Object} but you sent {'+ typeof source +'} '+ source);


            /*Go over each incoming arguments, if any left*/
            each(args, function (obj, id) {

                /*Validate object argument*/
                if (typeof obj != 'object') throw new Error('Argument '+ (id+2) +' must be an {Object} but you sent {'+ typeof obj +'} '+ obj);

                /*Copy by reference each argument object properties over the source*/
                each(obj, function (value, key) {
                    source[key] = value;
                });
            });


            /*Give the combined source object*/
            return source;
        };
    })();


    /**
     * Checks if the incoming 'obj' has any properties or length
     * 
     * @dependences
     *     isNumber()
     *     each()
     * 
     * @param  {Mixed}   obj  Variable to be checked if it has any looping data
     * @return {Boolean}      Flag if the incoming 'obj' is considered empty or not
     */
    function isEmpty(obj) {
        var has_properties = false;

        switch (obj) {

            /*Common case scenario*/
            case null:
            case {}:
            case []:
            case '':
            case undefined:
                return true;

            default:

                /*Any number is an empty object*/
                if (isNumber(obj)) return true;

                /*Any {String} with length will be considered not empty*/
                if (typeof obj === 'string' && obj.length) return false;

                /*Check if the incoming object contain any properties*/
                each(obj, function () {
                    has_properties = true;
                    return false;
                });

                return !has_properties;
        }
    }


    /**
     * Checks if the first two incoming variables are equal by type and value.
     * Objects are not been compared by property position but by property value, type, and length.
     * 
     * @dependences
     *     each()
     *     isEmpty()
     * 
     * @param  {Mixed}  var_1  1st var to be compared
     * @param  {Mixed}  var_2  2nd var to be compared
     * @return {Boolean}       Tells if both vars are "equal" or not
     */
    function isEqual(var_1, var_2) {
        var is_equal;

        /*Check if we need to compare 2 Objects*/
        if (
            typeof var_1 == 'object' &&
            typeof var_2 == 'object'
        ) {

            /*Try "lazy comparison" by converting the {Object} into {String} comparison*/
            if (JSON.stringify( var_1 ) == JSON.stringify( var_2 )) return true;


            /*Prevent data integrity*/
            var_2 = clone( var_2 );

            /*Check if all properties from var_1 are met in var_2*/
            is_equal = true;
            each(var_1, function (value, key) {

                /*Check if there's the same property in var_2*/
                if (var_2[key] === value) {

                    /*Try to leave var_2 as empty object*/
                    delete var_2[key];

                } else {

                    /*Mark the mismatch and prevent further looping*/
                    is_equal = false;
                    return false;
                }
            });


            /*Final check if var_2 has any properties left*/
            return is_equal ? isEmpty(var_2) : false;

        } else {

            /*Use the general compare operator if both are not objects*/
            return var_1 === var_2;
        }
    }


    /**
     * Used to execute any function only once in a specified time frame
     * 
     * @param  {function}  func     The function that need to be executed only once after a specified 'timeout' time
     * @param  {integer}   timeout  Time in [milliseconds] that need to expire before calling the 'func' function
     */
    function debounce(func, timeout) {
        var timer, result;

        /*Validate input*/
        if (typeof func != 'function') throw new Error('1st argument must be a {function} but you sent {'+ typeof func +'} '+ func);
        if (!isInteger(timeout))       throw new Error('2nd argument must be a milliseconds {integer} number but you sent {'+ typeof timeout +'} '+ timeout);


        return function () {
            var
            THIS = this,
            args = arguments;

            /*Functional scope that will execute the incoming 'func' in a later time*/
            function executeFunc() {
                clearTimeout(timer);
                result = func.apply(THIS, args);
            }

            /*Secure a single calling of the 'func'*/
            clearTimeout(timer);
            timer = setTimeout(executeFunc, timeout);

            /*If there's no timer set we'll execute and collect the 'func' result right away*/
            if (!timer) result = func.apply(THIS, args);

            return result;
        };
    }



    /**
     * Cross-browser detection of jQuery event key code.
     * 
     * @dependences
     *     setDigits()
     * 
     * @param  {jQuery event}  event  A common event object come from 'keydown', 'keyup', or 'keypress' jQuery event callbacks
     * @return {Integer}              Final detected code of the pressed key
     */
    function eventToKey(event) {
        return event.keyCode ? event.keyCode : event.which;
    }


    /**
     * Return a section from the URL path (/section1/section2/...) by a given 0-based section position.
     * 
     * @dependences
     *     window - top DOM object
     * 
     * @param   Integer part_pos
     * @returns Mixed
     * 
     * @example
     *   getHrefPart(0)   => 'viewer'
     *   getHrefPart(999) => undefined
     *   getHrefPart('a') => undefined
     */
    function getHrefPart(part_pos) {
        part_pos = parseInt(part_pos, 10);

        return (
            (
                !isNaN( part_pos )                          &&
                typeof window                   == 'object' &&
                typeof window.location          == 'object' &&
                typeof window.location.pathname == 'string'
            )
            ? window.location.pathname.split('/')[ ++part_pos ]
            : undefined
        );
    }


    /**
     * Updates the HTML DOM element style attribute with a given CSS key-value pair.
     * Similar to $element(css_key, css_value);
     * 
     * @param {HTML Object}       element    Specific HTML element from the DOM tree that will update it's style attribute
     * @param {String CSS Key}    css_key    CSS property key that will have it's value set or updated if already set
     * @param {String CSS value}  css_value  CSS value that will be set to the specified CSS key
     */
    var updateElementStyle = (function () {
        var
        element_RegExp = null,
        element_style  = '';


        return function (element, css_key, css_value) {

            /*Secure specific function input*/
            if (
                typeof element   != 'object'              ||
                typeof element.getAttribute != 'function' ||
                typeof element.setAttribute != 'function' ||

                typeof css_key   != 'string' ||
                typeof css_value != 'string'
            ) throw new Error('updateElementStyle({HTML Object}, {String CSS key}, {String CSS value}) but it was sent: \
                {'+ typeof arguments[0] +'} '+ arguments[0] +', \
                {'+ typeof arguments[1] +'} '+ arguments[1] +', \
                {'+ typeof arguments[2] +'} '+ arguments[2]
            );


            /*Cache the current <element> style if any is been set*/
            element_style = ';'+ (element.getAttribute('style') || '');

            /*Prepare matching CSS expression and style rule that need to be updated*/
            element_RegExp = new RegExp(';'+ css_key + '(\s)*:([^;]+)', 'g');
            updated_style  = ';'+ css_key +': '+ css_value;


            /*Check if we need to set a new CSS rule or we need to update one*/
            if (element_RegExp.test( element_style )) {
                element_style = element_style.replace(element_RegExp, updated_style);
            } else {
                element_style = updated_style + element_style;
            }


            /*Record the update CSS key-value pair*/
            element.setAttribute('style', element_style.substr(1));
        };
    })();


    /*List of all externally accessed functionalities*/
    var utils = {
        log               : log,

        trim              : trim,
        normalize         : normalize,
        toString          : toString,
        clampString       : clampString,

        clampNumber       : clampNumber,
        roundAfterPoint   : roundAfterPoint,
        isNumber          : isNumber,
        isInteger         : isInteger,
        setDigits         : setDigits,

        each              : each,
        clone             : clone,

        toArray           : toArray,
        objectLength      : objectLength,

        formatDate        : formatDate,
        minutesLimitedTime: minutesLimitedTime,
        hoursLimitedTime  : hoursLimitedTime,
        timezone          : timezone,
        daylightSavingTime: daylightSavingTime,

        bind              : bind,
        extend            : extend,
        isEmpty           : isEmpty,
        isEqual           : isEqual,
        debounce          : debounce,
        eventToKey        : eventToKey,

        getHrefPart       : getHrefPart,
        updateElementStyle: updateElementStyle
    }
 

    /*Determine if we need to make an export for Node.js or common browser 'window' client*/
    var export_object = typeof module == 'object' && typeof module.exports == 'object' ? module.exports : (typeof window == 'object' ? (window.utils = {}) : {});

    /*Extend and override with all utility functions the object meant to be used for external access*/
    each( utils, function (util_function, util_name) {
        export_object[ util_name ] = util_function;
    });
})();