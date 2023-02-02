import { canUseCache } from './helpers'

describe('canUseCache', () => {
  it('returns true for included collections', () => {
    const apiBaseUrl = '/api'
    const originalUrl = '/api/collections/collection1'
    const includedCollections = ['collection1', 'collection2']
    const includedGlobals = ['global1', 'global2']
    const includedPaths = []

    expect(
      canUseCache({ apiBaseUrl, originalUrl, includedCollections, includedGlobals, includedPaths })
    ).toBeTruthy()
  })

  // it('returns true for included globals', () => {
  //   const entityName = 'global1'
  //   const includedCollections = ['collection1', 'collection2']
  //   const includedGlobals = ['global1', 'global2']

  //   expect(canUseCache({ entityName, includedCollections, includedGlobals })).toBeTruthy()
  // })

  // it('returns false for _preferences', () => {
  //   const entityName = '_preferences'
  //   const includedCollections = ['collection1', 'collection2']
  //   const includedGlobals = ['global1', 'global2']

  //   expect(canUseCache({ entityName, includedCollections, includedGlobals })).toBeFalsy()
  // })

  // it('returns false for entity not included in collections or globals', () => {
  //   const entityName = 'not_included'
  //   const includedCollections = ['collection1', 'collection2']
  //   const includedGlobals = ['global1', 'global2']

  //   expect(canUseCache({ entityName, includedCollections, includedGlobals })).toBeFalsy()
  // })
})
