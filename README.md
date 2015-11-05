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
var eventToPromise = require('event-to-promise')

function createServer (port) {
  var server = require('http').createServer()
  server.listen(port)

  // The server will be returned once it has started listening.
  //
  // If an error happened, it will be forwarded instead.
  return eventToPromise(server, 'listening').then(function () {
    return server
  })
}

// Using plain promise.
createServer(80).then(function (server) {
  console.log('Server listening on http://localhost:80/')
}).catch(function (error) {
  console.error('Server could not start:', error)
})
```

Event better using [ES2016 asynchronous functions](https://github.com/tc39/ecmascript-asyncawait):

```js
import eventToPromise from 'event-to-promise'

async function createServer (port) {
  var server = require('http').createServer()
  server.listen(port)

  await eventToPromise(server, 'listening')

  return server
}

async function main () {
  try {
    const server = await createServer(80);
    console.log('Server listening on http://localhost:80/');
  } catch (error) {
    console.error('Server could not start:', error);
  }
}

main()
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

##### array

Type: `boolean`
Default: `undefined`

This option controls how a listener's parameters are resolved by
its promise.

If true, the parameters are resolved as an array. If false,
the first parameter is resolved. If undefined (the default),
an array is resolved if there's more than one parameter;
otherwise, the first parameter is resolved.

##### error

Type: `string`
Default: `"error"`

The name of the event which rejects the promise.

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
