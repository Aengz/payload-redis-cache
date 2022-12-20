export interface PluginOptions {
  redisUrl: string
  redisNamespace?: string
  redisIndexesName?: string
}

export interface JwtToken {
  id: string
  collection: string
  email: string
}

export const DEFAULT_USER_COLLECTION = 'loggedout'
