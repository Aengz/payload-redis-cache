import { createClient, RedisClientType } from 'redis'

class RedisContext {
  private redisClient: RedisClientType

  //getter
  public getRedisClient(url: string): RedisClientType {
    if (!this.redisClient) {
      this.redisClient = createClient({ url })
    }
    return this.redisClient
  }
}

export const redisContext = new RedisContext()
