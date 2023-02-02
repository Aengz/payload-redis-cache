import { Config } from 'payload/config'
import { initRedisContext } from './adapters/redis'
import { invalidateCacheHook } from './hooks'
import { cacheMiddleware } from './middlewares'
import { PluginOptions, RedisInitOptions } from './types'
import { extendWebpackConfig } from './webpack'

export const initRedis = (params: RedisInitOptions) => {
  const {
    redisUrl: url,
    redisNamespace: namespace = 'payload',
    redisIndexesName: indexesName = 'payload-cache-index'
  } = params
  initRedisContext({ url, namespace, indexesName })
}

export const cachePlugin =
  (pluginOptions: PluginOptions) =>
  (config: Config): Config => {
    const includedCollections: string[] = []
    const includedGlobals: string[] = []
    // Merge incoming plugin options with the default ones
    const { excludedCollections = [], excludedGlobals = [], includedPaths = [] } = pluginOptions

    const collections = config?.collections
      ? config.collections?.map((collection) => {
          const { hooks } = collection

          if (!excludedCollections.includes(collection.slug)) {
            includedCollections.push(collection.slug)
          }

          const afterChange = [...(hooks?.afterChange || []), invalidateCacheHook]

          return {
            ...collection,
            hooks: {
              ...hooks,
              afterChange
            }
          }
        })
      : []

    const globals = config?.globals
      ? config.globals?.map((global) => {
          const { hooks } = global

          if (!excludedGlobals.includes(global.slug)) {
            includedGlobals.push(global.slug)
          }

          const afterChange = [...(hooks?.afterChange || []), invalidateCacheHook]

          return {
            ...global,
            hooks: {
              ...hooks,
              afterChange
            }
          }
        })
      : []

    return {
      ...config,
      admin: {
        ...(config?.admin || {}),
        webpack: extendWebpackConfig({ config })
      },
      collections,
      globals,
      express: {
        preMiddleware: [
          ...(config?.express?.preMiddleware || []),
          cacheMiddleware({
            includedCollections,
            includedGlobals,
            includedPaths,
            apiBaseUrl: config?.routes?.api || '/api'
          })
        ]
      }
    }
  }
