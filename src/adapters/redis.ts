import { createClient, RedisClientType } from 'redis'

export interface IRedisContext {
  getRedisClient: () => RedisClientType
}

export interface InitRedisContextParams {
  url: string
  namespace: string
  indexesName: string
}

class RedisContext implements IRedisContext {
  private redisClient: RedisClientType | null = null
  private namespace: string | null = null
  private indexesName: string | null = null

  public init(params: InitRedisContextParams) {
    const { url, namespace, indexesName } = params

    this.namespace = namespace
    this.indexesName = indexesName
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
  public getNamespace(): string {
    return this.namespace
  }
  public getIndexesName(): string {
    return this.indexesName
  }
}

export const redisContext = new RedisContext()
export const initRedisContext = (params: InitRedisContextParams) => {
  redisContext.init(params)
}
