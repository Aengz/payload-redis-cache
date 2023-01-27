# Payload Redis Cache Plugin

This plugin for [Payload CMS](https://github.com/payloadcms/payload) adds a cache layer to API endpoints.
The cache is based on the combination of the user's collection and the original URL.

### Requirements

- Payload version `1.0.19` or higher is required
- A [Redis](https://redis.io/) instance is required 

## Installation
To install the plugin, run one of the following commands:

```console
yarn add @aengz/payload-redis-cache
```
or
```console
npm install @aengz/payload-redis-cache
```

### Redis package
You also need to install the redis package if it is not already installed:

```console
yarn add redis
```
or
```console
npm install redis
```

## Usage

To use the plugin, add it to the Payload config as follows:

```js
import { buildConfig } from 'payload/config';
import { cachePlugin } from '@aengz/payload-redis-cache'

const config = buildConfig({
  // your config here
  
  plugins: [
    cachePlugin({ 
      excludedCollections: ['users'],
      //  excludedGlobals: ['myglobal']
    })
  ]
})
```

Add the initializer function in `server.ts`

```js
import { cachePlugin } from '@aengz/payload-redis-cache'

...

initRedis({
  redisUrl: process.env.REDIS_URI
})
```

## Plugin options

| Option| Type | Description |
|---|---|---|
| `redisUrl` * | `string` | Redis instance's url. |
| `redisNamespace` | `string` | Choose the prefix to use for cache redis keys. Defaults to `payload`. |
| `redisIndexesName` | `string` | Choose the index key for cache redis indexes. Defaults to `payload-cache-index`. |
| `excludedCollections` | `string[]` | An array of collection names to be excluded. |

A * denotes that the property is required.

## Helpers

This package provides utility functions for managing the cache. Here's an example of how to use the `invalidateCache` function:


```js
import { invalidateCache }  from '@aengz/payload-redis-cache'

...

invalidateCache()
```

## Development
There is a development environment in the `/dev` directory of the repository. To use it, create a new `.env` file in the `/dev` directory using the example `.env.example` file as a reference:

``` console
cd dev
cp .env.example .env
```

Before using the plugin in the development environment, the package needs to be built. To build the library, run one of the following commands:
### Build the lib 
Build the lib using:
```console
yarn dev:build
```
or
```console
npm run dev:build
```

### Use development environment
To run the development environment, use the following command:

```console
yarn dev
```
or 
```console
npm run dev
```

### Running test 
To run the test suite, use one of the following commands:
```console
yarn test
```
or
```console
npm run test
```

## License
[MIT](LICENSE)
