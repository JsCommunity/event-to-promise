'use strict'

/* eslint-env jest */

// ===================================================================

require('native-promise-only')

var EventEmitter = require('events').EventEmitter

var eventToPromise = require('./')

function rejectionOf (promise) {
  return promise.then(function (value) {
    throw value
  }, function (reason) {
    return reason
  })
}

// ===================================================================

var emitter

beforeEach(function () {
  emitter = new EventEmitter()
})

var param1 = 'param1'
var param2 = 'param2'

// ===================================================================

// TODO:
// - Tests handling multiple events.
// - Tests the different way to add/remove an event listener.

describe('eventToPromise()', function () {
  it('waits for an event', function () {
    var promise = eventToPromise(emitter, 'foo')

    emitter.emit('foo')

    return promise
  })

  // -----------------------------------------------------------------

  it('fowards first event parameter', function () {
    var promise = eventToPromise(emitter, 'foo')
    emitter.emit('foo', param1, param2)

    return promise.then(function (value) {
      expect(value).toBe(param1)
    })
  })

  // -----------------------------------------------------------------

  describe('array option', function () {
    it('forwards all parameters as an array', function () {
      var promise = eventToPromise(emitter, 'foo', {
        array: true
      })
      emitter.emit('foo', param1, param2)

      return promise.then(function (value) {
        expect(value.event).toBe('foo')
        expect(value.slice()).toEqual([ param1, param2 ])
      })
    })
  })

  // -----------------------------------------------------------------

  it('handles error event', function () {
    var error = new Error()

    var promise = eventToPromise(emitter, 'foo')
    emitter.emit('error', error)

    return rejectionOf(promise).then(function (value) {
      expect(value).toBe(error)
    })
  })

  // -----------------------------------------------------------------

  describe('error option', function () {
    it('handles a custom error event', function () {
      var error = new Error()

      var promise = eventToPromise(emitter, 'foo', {
        error: 'test-error'
      })
      emitter.emit('test-error', error)

      return rejectionOf(promise).then(function (value) {
        expect(value).toBe(error)
      })
    })
  })

  // -----------------------------------------------------------------

  describe('ignoreErrors option', function () {
    it('ignores error events', function () {
      var error = new Error()

      // Node requires at least one error listener.
      emitter.once('error', function noop () {})

      var promise = eventToPromise(emitter, 'foo', {
        ignoreErrors: true
      })
      emitter.emit('error', error)
      emitter.emit('foo', param1)

      return promise.then(function (value) {
        expect(value).toBe(param1)
      })
    })
  })

  // -----------------------------------------------------------------

  it('removes listeners after event', function () {
    var promise = eventToPromise(emitter, 'foo')
    emitter.emit('foo')

    return promise.then(function () {
      expect(emitter.listeners('foo')).toEqual([])
      expect(emitter.listeners('error')).toEqual([])
    })
  })

  // -----------------------------------------------------------------

  it('removes listeners after error', function () {
    var promise = eventToPromise(emitter, 'foo')
    emitter.emit('error')

    return promise.catch(function () {
      expect(emitter.listeners('foo')).toEqual([])
      expect(emitter.listeners('error')).toEqual([])
    })
  })
})

// ===================================================================

describe('eventToPromise.multi()', function () {
  it('resolves if one of the success events is emitted', function () {
    var promise = eventToPromise.multi(emitter, [ 'foo', 'bar' ])
    emitter.emit('foo', param1, param2)

    return promise.then(function (value) {
      expect(value.event).toBe('foo')
      expect(value.slice()).toEqual([ param1, param2 ])
    })
  })

  // -----------------------------------------------------------------

  it('rejects if one of the error events is emitted', function () {
    var promise = eventToPromise.multi(emitter, [], [ 'foo', 'bar' ])
    emitter.emit('bar', param1)

    return rejectionOf(promise).then(function (value) {
      expect(value.event).toBe('bar')
      expect(value.slice()).toEqual([ param1 ])
    })
  })
})
