import { RedisClientType } from 'redis'


interface RedisContextPayload {
  client: RedisClientType<any, any> // TODO: fix type here
}

class RedisContext {
  private payload: RedisContextPayload | undefined

  setClient(payload: RedisContextPayload): void {
    this.payload = payload
  }

  getClient(): RedisContextPayload | undefined {
    return this.payload
  }
}

export const redisContext: RedisContext = new RedisContext()