import { createClient, RedisClientType } from 'redis'

export interface IRedisContext {
  getRedisClient: () => RedisClientType
}

class RedisContext implements IRedisContext {
  private redisClient: RedisClientType

  public init(url: string) {
    if (!this.redisClient) {
      this.redisClient = createClient({ url })
      this.redisClient.connect()
    }
  }

  //getter
  public getRedisClient(): RedisClientType {
    return this.redisClient
  }
}

export const redisContext = new RedisContext()
