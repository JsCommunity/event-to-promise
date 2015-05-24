'use strict'

// ===================================================================

var Bluebird = require('bluebird')

// ===================================================================

// Faster `Function.bind()`.
function bind (fn, ctx) {
  return function bindedFunction () {
    return fn.apply(ctx, arguments)
  }
}

function noop () {}

var toArray = Array.from || (function (slice) {
  return bind(slice.call, slice)
})(Array.prototype.slice)

// ===================================================================

function eventToPromise (emitter, event, opts) {
  var ignoreErrors = opts && opts.ignoreErrors

  return new Bluebird(function (resolve, reject) {
    var addListener =
      emitter.addEventListener ||
      emitter.addListener ||
      emitter.on
    if (!addListener) {
      throw new Error('cannot register an event listener')
    }
    addListener = bind(addListener, emitter)

    var removeListener =
      emitter.removeEventListener ||
      emitter.removeListener

    var cleanUp, errorListener
    if (removeListener) {
      removeListener = bind(removeListener, emitter)

      cleanUp = function cleanUp () {
        removeListener(event, eventListener)
        errorListener && removeListener('error', errorListener)
      }
    } else {
      cleanUp = noop
    }

    function eventListener () {
      cleanUp()

      if (arguments.length < 2) {
        resolve(arguments[0])
      } else {
        resolve(toArray(arguments))
      }
    }
    emitter.on(event, eventListener)

    if (!ignoreErrors) {
      errorListener = function errorListener (error) {
        cleanUp()
        reject(error)
      }
      emitter.on('error', errorListener)
    }
  }).bind(emitter)
}
exports = module.exports = eventToPromise
