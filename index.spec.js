'use strict'

/* eslint-env mocha */

// ===================================================================

var eventToPromise = require('./')

// -------------------------------------------------------------------

var expect = require('chai').expect

// -------------------------------------------------------------------

var EventEmitter = require('events').EventEmitter

// ===================================================================

// TODO:
// - Forcing the parameters to be forwarded in an array for
//   consistency and predictability.
// - Maybe handling multiple events.
// - Tests the different way to add/remove an event listener.

describe('event-to-promise', function () {
  var emitter

  beforeEach(function () {
    emitter = new EventEmitter()
  })

  // -----------------------------------------------------------------

  it('waits for an event', function () {
    var emitted = false

    var promise = eventToPromise(emitter, 'foo')

    // Delay the event emission of two ticks to make sure the promise
    // has a chance to run before the event.
    process.nextTick(function () {
      process.nextTick(function () {
        emitter.emit('foo')
        emitted = true
      })
    })

    return promise.then(function () {
      expect(emitted).to.be.true
    })
  })

  // -----------------------------------------------------------------

  it('fowards event parameter', function () {
    var parameter = {}

    var promise = eventToPromise(emitter, 'foo')
    emitter.emit('foo', parameter)

    return promise.then(function (value) {
      expect(value).to.equal(parameter)
    })
  })

  // -----------------------------------------------------------------

  it('fowards multiple event parameters in an array', function () {
    var param0 = {}
    var param1 = {}

    var promise = eventToPromise(emitter, 'foo')
    emitter.emit('foo', param0, param1)

    return promise.then(function (values) {
      expect(values).to.have.length(2)
      expect(values[0]).to.equal(param0)
      expect(values[1]).to.equal(param1)
    })
  })

  // -----------------------------------------------------------------

  it('handles error event', function () {
    var error = new Error()

    var promise = eventToPromise(emitter, 'foo')
    emitter.emit('error', error)

    return promise.then(
      function () {
        expect('should not be executed').to.be.true
      },
      function (err) {
        expect(err).to.equal(error)
      }
    )
  })

  it('can ignore error events', function () {
    var error = new Error()

    // Node requires at least one error listener.
    emitter.on('error', function noop () {})

    var promise = eventToPromise(emitter, 'foo', {
      ignoreErrors: true
    })
    emitter.emit('error', error)
    emitter.emit('foo')

    return promise
  })

  // -----------------------------------------------------------------

  it('removes listeners after event', function () {
    var promise = eventToPromise(emitter, 'foo')
    emitter.emit('foo')

    return promise.then(function () {
      expect(emitter.listeners('foo')).to.be.empty
      expect(emitter.listeners('error')).to.be.empty
    })
  })

  // -----------------------------------------------------------------

  it('removes listeners after error', function () {
    var promise = eventToPromise(emitter, 'foo')
    emitter.emit('error')

    return promise.catch(function () {
      expect(emitter.listeners('foo')).to.be.empty
      expect(emitter.listeners('error')).to.be.empty
    })
  })

  // -----------------------------------------------------------------

  it('forwards the event context', function () {
    var promise = eventToPromise(emitter, 'foo')
    emitter.emit('foo')

    return promise.then(function () {
      expect(this).to.equal(emitter)
    })
  })

  // -----------------------------------------------------------------

  it('forwards the error context', function () {
    var promise = eventToPromise(emitter, 'foo')
    emitter.emit('error')

    return promise.catch(function () {
      expect(this).to.equal(emitter)
    })
  })
})
