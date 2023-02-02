import { getEntityName } from '../adapters/cacheHelpers'
import { cacheMiddlewareArgs } from '../types'

interface canUseCacheArgs extends cacheMiddlewareArgs {
  originalUrl: string
}

export const canUseCache = ({
  apiBaseUrl,
  originalUrl,
  includedCollections,
  includedGlobals,
  includedPaths
}: canUseCacheArgs) => {
  const collectionsEntityName = getEntityName(apiBaseUrl, originalUrl, 'collections')
  const globalsEntityName = getEntityName(apiBaseUrl, originalUrl, 'globals')
  
  const pathEntityName = originalUrl.replace(apiBaseUrl, '')


  return originalUrl.includes('_preferences') && (
    includedCollections.includes(collectionsEntityName) ||  
    includedGlobals.includes(globalsEntityName) ||
    includedPaths.includes(pathEntityName) 
}
