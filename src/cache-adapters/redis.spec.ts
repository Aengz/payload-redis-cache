import { createClient, RedisClientType } from 'redis'
import { initRedisContext, redisContext } from './redis'

jest.mock('redis', () => ({
  createClient: jest.fn()
}))

describe('RedisContext', () => {
  let redisClient: RedisClientType

  beforeEach(() => {
    redisClient = {
      connect: jest.fn()
    } as any
  })

  describe('initRedisContext', () => {
    it('should call the init method of the RedisContext instance with the provided params', () => {
      ;(createClient as jest.Mock).mockReturnValue(redisClient)

      const params = {
        url: 'redis://localhost',
        namespace: 'namespace',
        indexesName: 'indexesName'
      }
      initRedisContext(params)

      expect(createClient).toHaveBeenCalledWith({ url: 'redis://localhost' })
      expect(redisClient.connect).toHaveBeenCalled()
    })
  })

  describe('redisContext', () => {
    it('After init should get redis context', () => {
      ;(createClient as jest.Mock).mockReturnValue(redisClient)

      const params = {
        url: 'redis://localhost',
        namespace: 'namespace',
        indexesName: 'indexesName'
      }
      initRedisContext(params)

      expect(redisContext.getRedisClient()).toBe(redisClient)
      expect(redisContext.getNamespace()).toBe('namespace')
      expect(redisContext.getIndexesName()).toBe('indexesName')
    })
    it('Should set redisClient to null if there is an error creating the client', () => {
      ;(createClient as jest.Mock).mockImplementation(() => {
        throw new Error('Error creating client')
      })

      const params = {
        url: 'redis://localhost',
        namespace: 'namespace',
        indexesName: 'indexesName'
      }
      initRedisContext(params)

      expect(redisContext.getRedisClient()).toBeNull()
      expect(redisContext.getNamespace()).toBe('namespace')
      expect(redisContext.getIndexesName()).toBe('indexesName')
    })
  })
})
