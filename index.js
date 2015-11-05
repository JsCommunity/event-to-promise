'use strict'

// ===================================================================

var AnyPromise = require('any-promise')

// ===================================================================

// Faster `Function.bind()`.
function bind (fn, ctx) {
  return function boundFunction () {
    return fn.apply(ctx, arguments)
  }
}

function noop () {}

var toArray = Array.from || (function (slice) {
  return bind(slice.call, slice)
})(Array.prototype.slice)

// ===================================================================

function eventToPromise (emitter, event, _opts) {
  var opts = _opts || {}
  var ignoreErrors = opts.ignoreErrors
  var errorEvent = opts.error || 'error'

  return new AnyPromise(function (resolve, reject) {
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
        errorListener && removeListener(errorEvent, errorListener)
      }
    } else {
      cleanUp = noop
    }

    function eventListener () {
      cleanUp()

      if ('array' in opts) {
        if (opts.array) {
          resolve(toArray(arguments))
        } else {
          resolve(arguments[0])
        }
      } else { // legacy behaviour for backwards compatibility
        if (arguments.length < 2) {
          resolve(arguments[0])
        } else {
          resolve(toArray(arguments))
        }
      }
    }
    addListener(event, eventListener)

    if (!ignoreErrors) {
      errorListener = function errorListener (error) {
        cleanUp()
        reject(error)
      }
      addListener(errorEvent, errorListener)
    }
  })
}
exports = module.exports = eventToPromise
