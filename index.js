'use strict';

//====================================================================

var Promise = require('bluebird');

//====================================================================

var toArray = Array.prototype.slice;
toArray = toArray.call.bind(toArray);

//====================================================================

module.exports = function (emitter, event) {
  return new Promise(function (resolve, reject) {
    var eventListener, errorListener;
    eventListener = function () {
      emitter.removeListener('error', errorListener);

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
      emitter.removeListener(event, eventListener);

      reject(error);
    };

    emitter.once(event, eventListener);
    emitter.once('error', errorListener);
  }).bind(emitter);
};
