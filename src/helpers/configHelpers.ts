import { PluginOptions } from '../types'

export const getPluginConfig = (config: PluginOptions): PluginOptions => {
  const defaultConfig: Partial<PluginOptions> = {
    redisNamespace: 'payload'
  }

  return {
    ...defaultConfig,
    ...config
  }
}
