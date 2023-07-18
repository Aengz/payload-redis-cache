import { createClient, RedisClientType } from 'redis'
import { logger } from './logger'

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
      logger.info('Connected to Redis successfully!')

      this.redisClient.on('error', (error) => {
        logger.error(error)
      })
    } catch (e) {
      this.redisClient = null
      logger.info('Unable to connect to Redis!')
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
