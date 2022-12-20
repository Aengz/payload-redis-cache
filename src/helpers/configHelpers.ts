import { PluginOptions } from '../types'

export const getPluginConfig = (config: PluginOptions): PluginOptions => {
  const defaultConfig: Partial<PluginOptions> = {
    redisNamespace: 'payload',
    redisIndexesName: 'payload-cache-index'
  }

  return {
    ...defaultConfig,
    ...config
  }
}
