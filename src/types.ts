export interface RedisInitOptions {
  redisUrl: string
  redisNamespace?: string
  redisIndexesName?: string
}

export interface PluginOptions {
  excludedCollections?: string[]
  excludedGlobals?: string[]
}

export interface JwtToken {
  id: string
  collection: string
  email: string
}

export const DEFAULT_USER_COLLECTION = 'loggedout'
