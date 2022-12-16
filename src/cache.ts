import { Config } from 'payload/config'
import { getCacheHook, upsertCacheHook } from './hooks'
import { PluginOptions } from './types'

export const CachePlugin =
  (pluginOptions: PluginOptions) =>
  (incomingConfig: Config): Config => {
    const { redisURL: redisUrl } = pluginOptions
    const collections = incomingConfig.collections?.map((collection) => {
      const { hooks } = collection
      const afterChange = [...(hooks?.afterChange || []), upsertCacheHook(redisUrl)]
      const beforeOperation = [...(hooks?.beforeOperation || []), getCacheHook(redisUrl)]

      return {
        ...collection,
        hooks: {
          ...hooks,
          afterChange,
          beforeOperation
        }
      }
    })

    const config: Config = {
      ...incomingConfig,
      collections
    }

    return {
      ...config
    }
  }
