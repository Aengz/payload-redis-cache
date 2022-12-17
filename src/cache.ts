import { Config } from 'payload/config'
import { getCacheHook, upsertCacheHook } from './hooks'
import { PluginOptions } from './types'
import { extendWebpackConfig } from './webpack'

export const cachePlugin =
  (pluginOptions: PluginOptions) =>
  (config: Config): Config => {
    const { redisURL: redisUrl } = pluginOptions
    const collections = config.collections?.map((collection) => {
      const { hooks } = collection
      const afterRead = [...(hooks?.afterRead || []), upsertCacheHook(redisUrl)]
      const beforeOperation = [...(hooks?.beforeOperation || []), getCacheHook(redisUrl)]

      return {
        ...collection,
        hooks: {
          ...hooks,
          afterRead,
          beforeOperation
        }
      }
    })

    return {
      ...config,
      admin: {
        ...(config.admin || {}),
        webpack: extendWebpackConfig({ config })
      },
      collections
    }
  }
