export interface PluginOptions {
  redisUrl: string
  redisNamespace?: string
  redisIndexesName?: string
  excludedCollections?: string[]
  excludedGlobals?: string[]
}

export interface JwtToken {
  id: string
  collection: string
  email: string
}

export const DEFAULT_USER_COLLECTION = 'loggedout'
