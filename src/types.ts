export interface PluginOptions {
  redisUrl: string
  redisNamespace?: string
}

export interface JwtToken {
  id: string
  collection: string
  email: string
}
