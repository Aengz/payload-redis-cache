import { createClient, RedisClientType } from 'redis'

export interface IRedisContext {
  getRedisClient: () => RedisClientType
}

class RedisContext implements IRedisContext {
  private redisClient: RedisClientType
  private url: string

  public constructor(url: string) {
    this.url = url
  }

  //getter
  public getRedisClient(): RedisClientType {
    if (!this.redisClient) {
      this.redisClient = createClient({ url: this.url })
      this.redisClient.connect()
    }
    return this.redisClient
  }
}

export const getRedisContext = (url: string) => new RedisContext(url)
