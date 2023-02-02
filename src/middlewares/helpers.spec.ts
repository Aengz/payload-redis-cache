import { canUseCache, getEntityName } from './helpers'

describe('canUseCache', () => {
  it('returns true for included collections', () => {
    const apiBaseUrl = '/api'
    const originalUrl = '/api/collection1'
    const includedCollections = ['collection1', 'collection2']
    const includedGlobals = ['global1', 'global2']
    const includedPaths = []

    expect(
      canUseCache({ apiBaseUrl, originalUrl, includedCollections, includedGlobals, includedPaths })
    ).toBeTruthy()
  })

  it('returns true for included collections', () => {
    const apiBaseUrl = '/api'
    const originalUrl = '/api/collection1?q=1'
    const includedCollections = ['collection1', 'collection2']
    const includedGlobals = ['global1', 'global2']
    const includedPaths = []

    expect(
      canUseCache({ apiBaseUrl, originalUrl, includedCollections, includedGlobals, includedPaths })
    ).toBeTruthy()
  })

  it('returns true for included globals', () => {
    const apiBaseUrl = '/api'
    const originalUrl = '/api/globals/main-menu'
    const includedCollections = ['collection1', 'collection2']
    const includedGlobals = ['main-menu']
    const includedPaths = []

    expect(
      canUseCache({ apiBaseUrl, originalUrl, includedCollections, includedGlobals, includedPaths })
    ).toBeTruthy()
  })

  it('returns true for included sub path in globals', () => {
    const apiBaseUrl = '/api'
    const originalUrl = '/api/globals/navigation/main-menu'
    const includedCollections = ['collection1', 'collection2']
    const includedGlobals = ['navigation']
    const includedPaths = []

    expect(
      canUseCache({ apiBaseUrl, originalUrl, includedCollections, includedGlobals, includedPaths })
    ).toBeTruthy()
  })

  it('returns true for custom paths', () => {
    const apiBaseUrl = '/api'
    const originalUrl = '/api/navigation/main-menu'
    const includedCollections = ['collection1', 'collection2']
    const includedGlobals = ['main-menu']
    const includedPaths = ['/navigation/main-menu']

    expect(
      canUseCache({ apiBaseUrl, originalUrl, includedCollections, includedGlobals, includedPaths })
    ).toBeTruthy()
  })

  it('returns false for not matching custom paths', () => {
    const apiBaseUrl = '/api'
    const originalUrl = '/api/navigation/main-menu'
    const includedCollections = ['collection1', 'collection2']
    const includedGlobals = ['main-menu']
    const includedPaths = ['/navigation/']

    expect(
      canUseCache({ apiBaseUrl, originalUrl, includedCollections, includedGlobals, includedPaths })
    ).toBeFalsy()
  })

  it('returns false for _preferences', () => {
    const apiBaseUrl = '/api'
    const originalUrl = '/api/_preferences/something'
    const includedCollections = ['collection1', 'collection2']
    const includedGlobals = ['main-menu']
    const includedPaths = []

    expect(
      canUseCache({ apiBaseUrl, originalUrl, includedCollections, includedGlobals, includedPaths })
    ).toBeFalsy()
  })
})

describe('getEntityName', () => {
  it('returns the correct collection name', () => {
    const apiBaseUrl = '/api'

    expect(getEntityName(apiBaseUrl, '/api/users/')).toBe('users')
    expect(getEntityName(apiBaseUrl, '/api/users/other')).toBe('users')
    expect(getEntityName(apiBaseUrl, '/api/posts/')).toBe('posts')
    expect(getEntityName(apiBaseUrl, '/api/comments/')).toBe('comments')
    expect(getEntityName(apiBaseUrl, '/api/comments/test')).toBe('comments')
    expect(getEntityName(apiBaseUrl, '/api/comments?where=1')).toBe('comments')
    expect(getEntityName(apiBaseUrl, '/api/globals/home?where=1', 'globals')).toBe('home')
    expect(getEntityName(apiBaseUrl, '/api/globals/home', 'globals')).toBe('home')
  })

  it('returns null for invalid input', () => {
    const apiBaseUrl = '/api'
    expect(getEntityName(apiBaseUrl, '/other/comments/')).toBe(null)
  })
})
