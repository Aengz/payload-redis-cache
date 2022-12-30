# Payload Redis Cache Plugin

A plugin for [Payload CMS](https://github.com/payloadcms/payload)  to add a cache layer to the API endpoints.

Cache is based on user.collection + originalUrl

### Requirements

- Payload version `1.0.19` or higher is required
- A [Redis](https://redis.io/) instance is required 

## Installation
```console
yarn add @aengz/payload-redis-cache
yarn add redis // if not installed yet
```
or
```console
npm install @aengz/payload-redis-cache
npm install redis // if not installed yet
```

## Usage

Install this plugin within your Payload config as follows:

```js
import { buildConfig } from 'payload/config';
import { cachePlugin } from '@aengz/payload-redis-cache'

const config = buildConfig({
  plugins: [
    cachePlugin({ 
      redisUrl: 'redis://localhost:6379' 
    })
  ]
})
```

## Plugin options

| Option| Type | Description |
|---|---|---|
| `redisUrl` * | `string` | Redis instance's url. |
| `redisNamespace` | `string` | Choose the prefix to use for cache redis keys. Defaults to `payload`. |
| `redisIndexesName` | `string` | Choose the index key for cache redis indexes. Defaults to `payload-cache-index`. |

A * denotes that the property is required.

## Development
In the repo there is a development environment in the `/dev` directory.
To use it you need to create a new `.env` file (use the example `.env.example`) in the `/dev` directory.

``` console
cd dev
cp .env.example .env
```

Before use the plugin in the development environment the package needs to be built. 
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
To run develoment environment, run:

```console
yarn dev
```
or 
```console
npm run dev
```

### Running test 
To run the test suite:
```console
yarn test
```
or
```console
npm run test
```

## License
[MIT](LICENSE)
