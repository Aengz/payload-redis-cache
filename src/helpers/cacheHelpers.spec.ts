import { crypto, redisContext } from '../adapters'
import { generateCacheHash } from './cacheHelpers'
// const namespace = redisContext.getNamespace()

jest.mock('../adapters')

describe('cacheHelpers', () => {
  describe('generateCacheHash', () => {
    const STUB_USER_COLLECTION = 'users'
    const STUB_REQUESTED_URL = 'http://localhost:3000/api/example'
    const STUB_DIGESTED_VALUE = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'

    let hashMock: any
    beforeEach(() => {
      hashMock = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(STUB_DIGESTED_VALUE)
      }
      ;(crypto.createHash as jest.Mock).mockReturnValue(hashMock)
    })

    it('sha256 should be used', () => {
      generateCacheHash(STUB_USER_COLLECTION, STUB_REQUESTED_URL)
      expect(crypto.createHash).toHaveBeenCalledWith('sha256')
    })

    it('kebab case union should be passed to the update', () => {
      const expectedValue = 'users-http://localhost:3000/api/example'
      generateCacheHash(STUB_USER_COLLECTION, STUB_REQUESTED_URL)
      expect(hashMock.update).toHaveBeenCalledWith(expectedValue)
    })

    it('should generate a cache hash for the given user collection and requested URL', () => {
      ;(redisContext.getNamespace as jest.Mock).mockReturnValue('namespace')
      const expectedHash =
        'namespace:2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
      const result = generateCacheHash(STUB_USER_COLLECTION, STUB_REQUESTED_URL)
      expect(result).toEqual(expectedHash)
    })
  })
})
