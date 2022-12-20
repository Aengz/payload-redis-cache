import { getPluginConfig } from './configHelpers'

describe('configHelpers', () => {
  describe('getPluginConfig', () => {
    const STUB_REDIS_URL = 'redis://localhost:6379'
    it('should return default config if no config is provided', () => {
      const config = getPluginConfig({ redisUrl: STUB_REDIS_URL })
      expect(config).toEqual({
        redisNamespace: 'payload',
        redisIndexesName: 'payload-cache-index',
        redisUrl: STUB_REDIS_URL
      })
    })

    it('should override default config with provided config', () => {
      const config = getPluginConfig({ redisNamespace: 'custom', redisUrl: STUB_REDIS_URL })
      expect(config).toEqual({
        redisNamespace: 'custom',
        redisIndexesName: 'payload-cache-index',
        redisUrl: STUB_REDIS_URL
      })
    })
  })
})
