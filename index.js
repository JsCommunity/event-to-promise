'use strict';

//====================================================================

var Bluebird = require('bluebird');

//====================================================================

// Faster `Function.bind()`.
function bind(fn, ctx) {
  return function bindedFunction() {
    return fn.apply(ctx, arguments);
  };
}

function noop() {}

var toArray = Array.from || (function (slice) {
  return bind(slice.call, slice);
})(Array.prototype.slice);

//====================================================================

function eventToPromise(emitter, event) {
  return new Bluebird(function (resolve, reject) {
    // Some emitter do not implement removeListener.
    var removeListener = emitter.removeListener ?
      bind(emitter.removeListener, emitter) :
      noop
    ;

    function eventListener() {
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
    }
    function errorListener(error) {
      removeListener(event, eventListener);
      removeListener('error', errorListener);

      reject(error);
    }

    emitter.on(event, eventListener);
    emitter.on('error', errorListener);
  }).bind(emitter);
}
exports = module.exports = eventToPromise;
