'use strict';

//====================================================================

var Bluebird = require('bluebird');

//====================================================================

// Faster `Function.bind()`.
var bind = function (fn, ctx) {
  return function () {
    return fn.apply(ctx, arguments);
  };
};

var noop = function () {};

var toArray = Array.prototype.slice;
toArray = toArray.call.bind(toArray);

//====================================================================

module.exports = function (emitter, event) {
  return new Bluebird(function (resolve, reject) {
    // Some emitter do not implement removeListener.
    var removeListener = emitter.removeListener ?
      bind(emitter.removeListener, emitter) :
      noop
    ;


    var eventListener, errorListener;
    eventListener = function () {
      removeListener(event, eventListener);
      removeListener('error', errorListener);

      if (arguments.length < 2)
      {
        resolve(arguments[0]);
      }
      else
      {
        resolve(toArray(arguments));
      }
    };
    errorListener = function (error) {
      removeListener(event, eventListener);
      removeListener('error', errorListener);

      reject(error);
    };

    emitter.on(event, eventListener);
    emitter.on('error', errorListener);
  }).bind(emitter);
};
