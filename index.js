'use strict';

//====================================================================

var Promise = require('bluebird');

//====================================================================

var toArray = Array.prototype.slice;
toArray = toArray.call.bind(toArray);

//====================================================================

module.exports = function (emitter, event) {
  var deferred = Promise.defer();

  var eventListener, errorListener;
  eventListener = function () {
    emitter.removeListener('error', errorListener);

    if (arguments.length < 2)
    {
      deferred.resolve(arguments[0]);
    }
    else
    {
      deferred.resolve(toArray(arguments));
    }
  };
  errorListener = function (error) {
    emitter.removeListener(event, eventListener);

    deferred.reject(error);
  };

  emitter.once(event, eventListener);
  emitter.once('error', errorListener);

  return deferred.promise.bind(emitter);
};
