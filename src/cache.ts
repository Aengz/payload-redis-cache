import { Config } from 'payload/config'
import { initCache } from './helpers'
import { invalidateCacheHook } from './hooks'
import { cacheMiddleware } from './middlewares'
import { PluginOptions } from './types'
import { extendWebpackConfig } from './webpack'

export const cachePlugin =
  (pluginOptions: PluginOptions) =>
  (config: Config): Config => {
    const includedCollections: string[] = []
    // Merge incoming plugin options with the default ones
    const {
      redisUrl,
      redisNamespace = 'payload',
      redisIndexesName = 'payload-cache-index',
      excludedCollections = []
    } = pluginOptions

    // Redis connection
    initCache({
      url: redisUrl,
      namespace: redisNamespace,
      indexesName: redisIndexesName
    })

    // apply to all collections
    // TODO use an array of collections intead of using all of them
    const collections = config.collections?.map((collection) => {
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

    return {
      ...config,
      admin: {
        ...(config.admin || {}),
        webpack: extendWebpackConfig({ config })
      },
      collections,
      express: {
        preMiddleware: [
          ...(config?.express?.preMiddleware || []),
          cacheMiddleware(includedCollections, config.routes?.api || '/api')
        ]
      }
    }
  }
