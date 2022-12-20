import { createClient, RedisClientType } from 'redis'

export interface IRedisContext {
  getRedisClient: () => RedisClientType
}

class RedisContext implements IRedisContext {
  private redisClient: RedisClientType | null = null

  public init(url: string) {
    try {
      this.redisClient = createClient({ url })
      this.redisClient.connect()
      console.log('Connected to Redis successfully!')
    } catch (e) {
      this.redisClient = null
      console.log('Unable to connect to Redis!')
    }
  }

  //getter
  public getRedisClient(): RedisClientType {
    return this.redisClient
  }
}

export const redisContext = new RedisContext()
export const initContext = (url: string) => {
  redisContext.init(url)
}
