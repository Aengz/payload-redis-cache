import { Config } from 'payload/config'
import { getRedisContext } from './adapters'
import { getCacheHook, upsertCacheHook } from './hooks'
import { PluginOptions } from './types'
import { extendWebpackConfig } from './webpack'

export const cachePlugin =
  (pluginOptions: PluginOptions) =>
  (config: Config): Config => {
    const { redisUrl } = pluginOptions
    const collections = config.collections?.map((collection) => {
      const { hooks } = collection

      const redisContext = getRedisContext(redisUrl)

      const afterChange = [...(hooks?.afterChange || []), upsertCacheHook(redisContext)]
      const beforeOperation = [...(hooks?.beforeOperation || []), getCacheHook(redisContext)]

      return {
        ...collection,
        hooks: {
          ...hooks,
          afterChange,
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
