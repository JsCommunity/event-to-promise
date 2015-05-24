# event-to-promise

[![Build Status](https://img.shields.io/travis/julien-f/event-to-promise/master.svg)](http://travis-ci.org/julien-f/event-to-promise)
[![Dependency Status](https://david-dm.org/julien-f/event-to-promise/status.svg?theme=shields.io)](https://david-dm.org/julien-f/event-to-promise)
[![devDependency Status](https://david-dm.org/julien-f/event-to-promise/dev-status.svg?theme=shields.io)](https://david-dm.org/julien-f/event-to-promise#info=devDependencies)

> Create a promise waiting for an event


## Install

Download [manually](https://github.com/julien-f/event-to-promise/releases) or with package-manager.

#### [npm](https://npmjs.org/package/event-to-promise)

```
npm install --save event-to-promise
```

## Example

```javascript
var eventToPromise = require('event-to-promise');

function createServer(port) {
  var server = require('http').createServer();
  server.listen(port);

  // The server will be returned once it has started listening.
  //
  // If an error happened, it will be forwarded instead.
  return eventToPromise(server, 'listening').then(function () {
    return server;
  });
};

// Using plain promise.
createServer(80).then(function (server) {
  console.log('Server listening on http://localhost:80/');
}).catch(function (error) {
  console.error('Server could not start:', error);
});

// Even better using generators!
require('bluebird').coroutine(function *() {
  try {
    var server = yield createServer(80);
    console.log('Server listening on http://localhost:80/');
  } catch (error) {
    console.error('Server could not start:', error);
  }
})();
```

## API

### eventToPromise(emitter, eventName, [options])

#### emitter

*Required*
Type: `object`

The event emitter you want to watch an event on.

#### eventName

*Required*
Type: `string`

The name of the event you want to watch.

#### options

##### ignoreErrors

Type: `boolean`
Default: `false`

Whether the error event should be ignored and not reject the promise.

## Contributing

Contributions are *very* welcome, either on the documentation or on
the code.

You may:

- report any [issue](https://github.com/julien-f/event-to-promise/issues)
  you've encountered;
- fork and create a pull request.

## License

ISC © [Julien Fontanet](http://julien.isonoe.net)
