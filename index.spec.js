'use strict';

//====================================================================

var eventToPromise = require('./');

//--------------------------------------------------------------------

var expect = require('chai').expect;

//--------------------------------------------------------------------

var EventEmitter = require('events').EventEmitter;

//====================================================================

// TODO: forcing the parameters to be forwarded in an array for
// consistency and predictability.

describe('event-to-promise', function () {
  var emitter;

  beforeEach(function () {
    emitter = new EventEmitter();
  });

  //------------------------------------------------------------------

  it('waits for an event', function () {
    var emitted = false;

    emitter.on('foo', function () {
      emitted = true;
    });

    var promise = eventToPromise(emitter, 'foo');

    // Delay the event emission of two ticks to make sure the promise
    // has a chance to run before the event.
    process.nextTick(function () {
      process.nextTick(function () {
        emitter.emit('foo');
      });
    });

    return promise.then(function () {
      expect(emitted).to.be.true;
    });
  });

  //------------------------------------------------------------------

  it('fowards event parameter', function () {
    var parameter = {};

    var promise = eventToPromise(emitter, 'foo');
    emitter.emit('foo', parameter);

    return promise.then(function (value) {
      expect(value).to.equal(parameter);
    });
  });

  //------------------------------------------------------------------

  it('fowards multiple event parameter in an array', function () {
    var parameters = [{}, {}];

    var promise = eventToPromise(emitter, 'foo');
    emitter.emit.apply(emitter, ['foo'].concat(parameters));

    return promise.then(function (values) {
      expect(values).to.deep.equal(parameters);
    });
  });

  //------------------------------------------------------------------

  it('handles error event', function () {
    var error = new Error();

    var promise = eventToPromise(emitter, 'foo');
    emitter.emit('error', error);

    return promise.then(
      function () {
        expect('should not be executed').to.be.true;
      },
      function (err) {
        expect(err).to.equal(error);
      }
    );
  });

  //------------------------------------------------------------------

  it('removes listener after event', function () {
    var promise = eventToPromise(emitter, 'foo');
    emitter.emit('foo');

    return promise.then(function () {
      expect(emitter.listeners('foo')).to.be.empty;
      expect(emitter.listeners('error')).to.be.empty;
    });
  });

  //------------------------------------------------------------------

  it('removes listener after error', function () {
    var promise = eventToPromise(emitter, 'foo');
    emitter.emit('error');

    return promise.catch(function () {
      expect(emitter.listeners('foo')).to.be.empty;
      expect(emitter.listeners('error')).to.be.empty;
    });
  });
});
