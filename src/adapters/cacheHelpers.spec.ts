import { generateCacheHash, getCacheItem, invalidateCache, setCacheItem } from './cacheHelpers'
import { crypto } from './crypto'
import { initRedisContext, InitRedisContextParams, redisContext } from './redis'
jest.mock('./redis')
jest.mock('./crypto')

const STUB_USER_COLLECTION = 'users'
const STUB_REQUESTED_URL = '/api/example'
const STUB_DIGESTED_VALUE = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
const STUB_CACHE_HASH = 'namespace:2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
const STUB_CACHE_ITEM = '{"data":{"id":123,"name":"John"}}'
const STUB_JSON_CACHE_ITEM = { data: { id: 123, name: 'John' } }

describe('cacheHelpers', () => {
  describe('generateCacheHash', () => {
    let hashMock: any
    beforeEach(() => {
      hashMock = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(STUB_DIGESTED_VALUE)
      }
      ;(<jest.Mock>crypto.createHash).mockReturnValue(hashMock)
    })

    it('sha256 should be used', () => {
      generateCacheHash({
        userCollection: STUB_USER_COLLECTION,
        requestedUrl: STUB_REQUESTED_URL,
        authorization: ''
      })
      expect(crypto.createHash).toHaveBeenCalledWith('sha256')
    })

    it('should pass a string to the update', () => {
      const expectedValue = 'users-/api/example-Bearer 1234'
      generateCacheHash({
        userCollection: STUB_USER_COLLECTION,
        requestedUrl: STUB_REQUESTED_URL,
        authorization: 'Bearer 1234'
      })
      expect(hashMock.update).toHaveBeenCalledWith(expectedValue)
    })

    it('should generate a cache hash for the given user collection and requested URL', () => {
      ;(<jest.Mock>redisContext.getNamespace).mockReturnValue('namespace')
      const result = generateCacheHash({
        userCollection: STUB_USER_COLLECTION,
        requestedUrl: STUB_REQUESTED_URL,
        authorization: ''
      })
      expect(result).toEqual(STUB_CACHE_HASH)
    })
  })

  describe('getCacheItem', () => {
    let spyedGenerateCacheHash: jest.SpyInstance

    beforeEach(() => {
      const actualCacheHelpers = jest.requireActual('./cacheHelpers')
      spyedGenerateCacheHash = jest.spyOn(actualCacheHelpers, 'generateCacheHash')
      ;(generateCacheHash as jest.Mock).mockReturnValue(STUB_CACHE_HASH)
    })

    it('should return null if the redis client is not available', async () => {
      // Mock the redisContext module to return a null redis client
      ;(<jest.Mock>redisContext.getRedisClient).mockReturnValue(null)

      const result = await getCacheItem({
        userCollection: STUB_USER_COLLECTION,
        requestedUrl: STUB_REQUESTED_URL,
        authorization: ''
      })
      expect(result).toBeNull()
      expect(spyedGenerateCacheHash).not.toBeCalled()
    })

    it('should return null if the cache item is not found in the cache', async () => {
      // Mock the redisContext module to return a mocked redis client
      const redisClientMock = {
        GET: jest.fn().mockResolvedValue(null)
      }
      ;(<jest.Mock>redisContext.getRedisClient).mockReturnValue(redisClientMock)

      const result = await getCacheItem({
        userCollection: STUB_USER_COLLECTION,
        requestedUrl: STUB_REQUESTED_URL,
        authorization: ''
      })
      expect(result).toBeNull()
      expect(spyedGenerateCacheHash).toBeCalledWith({
        userCollection: STUB_USER_COLLECTION,
        requestedUrl: STUB_REQUESTED_URL,
        authorization: ''
      })
      expect(redisClientMock.GET).toBeCalledWith(STUB_CACHE_HASH)
    })

    it('should return the cache item if it is found in the cache', async () => {
      // Mock the redisContext module to return a mocked redis client
      const redisClientMock = {
        GET: jest.fn().mockResolvedValue(STUB_CACHE_ITEM)
      }
      ;(<jest.Mock>redisContext.getRedisClient).mockReturnValue(redisClientMock)

      const result = await getCacheItem({
        userCollection: STUB_USER_COLLECTION,
        requestedUrl: STUB_REQUESTED_URL,
        authorization: ''
      })
      expect(result).toEqual(STUB_CACHE_ITEM)
      expect(spyedGenerateCacheHash).toBeCalledWith({
        userCollection: STUB_USER_COLLECTION,
        requestedUrl: STUB_REQUESTED_URL,
        authorization: ''
      })
      expect(redisClientMock.GET).toBeCalledWith(STUB_CACHE_HASH)
    })
  })

  describe('setCacheItem', () => {
    let spyedGenerateCacheHash: jest.SpyInstance

    beforeEach(() => {
      const actualCacheHelpers = jest.requireActual('./cacheHelpers')
      spyedGenerateCacheHash = jest.spyOn(actualCacheHelpers, 'generateCacheHash')
      ;(generateCacheHash as jest.Mock).mockReturnValue(STUB_CACHE_HASH)
    })

    it('should return immidiatly if redis client is not available', () => {
      // Mock the redisContext module to return a null redis client
      ;(<jest.Mock>redisContext.getRedisClient).mockReturnValue(null)

      setCacheItem({
        userCollection: STUB_USER_COLLECTION,
        requestedUrl: STUB_REQUESTED_URL,
        authorization: '',
        paginatedDocs: STUB_JSON_CACHE_ITEM
      })
      expect(spyedGenerateCacheHash).not.toBeCalled()
    })

    it('should set the cache item in Redis', () => {
      // Mock the redisContext module to return a mocked redis client
      const redisClientMock = {
        SET: jest.fn(),
        SADD: jest.fn()
      }
      ;(<jest.Mock>redisContext.getRedisClient).mockReturnValue(redisClientMock)
      ;(<jest.Mock>redisContext.getIndexesName).mockReturnValue('indexes')

      setCacheItem({
        userCollection: STUB_USER_COLLECTION,
        requestedUrl: STUB_REQUESTED_URL,
        authorization: '',
        paginatedDocs: STUB_JSON_CACHE_ITEM
      })

      expect(redisClientMock.SET).toHaveBeenCalledWith(STUB_CACHE_HASH, STUB_CACHE_ITEM)
      expect(redisClientMock.SADD).toHaveBeenCalledWith('indexes', STUB_CACHE_HASH)
    })

    it('should catch error if unable to set the cache item in Redis', () => {
      // Mock the redisContext module to return a mocked redis client
      const redisClientMock = {
        SET: jest.fn(() => {
          throw new Error('Error setting cache item')
        }),
        SADD: jest.fn()
      }
      ;(<jest.Mock>redisContext.getRedisClient).mockReturnValue(redisClientMock)
      ;(<jest.Mock>redisContext.getIndexesName).mockReturnValue('indexes')

      setCacheItem({
        userCollection: STUB_USER_COLLECTION,
        requestedUrl: STUB_REQUESTED_URL,
        authorization: '',
        paginatedDocs: STUB_JSON_CACHE_ITEM
      })

      expect(redisClientMock.SET).toHaveBeenCalledWith(STUB_CACHE_HASH, STUB_CACHE_ITEM)
      expect(redisClientMock.SADD).not.toHaveBeenCalled()
    })
  })
  describe('invalidateCache', () => {
    let getIndexesNameMock: jest.Mock

    beforeEach(() => {
      getIndexesNameMock = (<jest.Mock>redisContext.getIndexesName).mockReturnValue('indexes')
    })

    it('should return immidiatly if redis client is not available', async () => {
      // Mock the redisContext module to return a null redis client
      ;(<jest.Mock>redisContext.getRedisClient).mockReturnValue(null)

      await invalidateCache()
      expect(getIndexesNameMock).not.toBeCalled()
    })

    it('should invalidate the cache in Redis', async () => {
      // Mock the redisContext module to return a mocked redis client
      const redisClientMock = {
        SMEMBERS: jest.fn(() => Promise.resolve(['index1', 'index2'])),
        DEL: jest.fn(),
        SREM: jest.fn()
      }
      ;(<jest.Mock>redisContext.getRedisClient).mockReturnValue(redisClientMock)

      await invalidateCache()

      expect(redisClientMock.SMEMBERS).toHaveBeenCalledWith('indexes')
      expect(redisClientMock.DEL).toHaveBeenCalledWith('index1')
      expect(redisClientMock.DEL).toHaveBeenCalledWith('index2')
      expect(redisClientMock.SREM).toHaveBeenCalledWith('indexes', 'index1')
      expect(redisClientMock.SREM).toHaveBeenCalledWith('indexes', 'index2')
    })

    it('should throw an error if unable to invalidate the cache in Redis', async () => {
      console.log = jest.fn()
      // Mock the redisContext module to return a mocked redis client
      const redisClientMock = {
        SMEMBERS: jest.fn().mockRejectedValue(new Error('Error getting cache indexes')),
        DEL: jest.fn(),
        SREM: jest.fn()
      }
      ;(<jest.Mock>redisContext.getRedisClient).mockReturnValue(redisClientMock)

      await expect(invalidateCache()).rejects.toThrow('Error getting cache indexes')
    })
  })

  describe('initCache', () => {
    it('should initialize the Redis context with the given parameters', () => {
      const params: InitRedisContextParams = {
        url: 'redis://localhost:6379',
        namespace: 'payload',
        indexesName: 'indexes'
      }

      // Mock the initRedisContext function to verify that it is called with the correct parameters
      const getRedisClientMock = (<jest.Mock>initRedisContext).mockImplementation(() => {})

      initRedisContext(params)

      // Assert that the initRedisContext function was called with the correct parameters
      expect(getRedisClientMock).toHaveBeenCalledWith(params)
    })
  })
})
