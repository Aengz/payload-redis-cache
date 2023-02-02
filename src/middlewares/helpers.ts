import { cacheMiddlewareArgs } from '../types'

interface canUseCacheArgs extends cacheMiddlewareArgs {
  originalUrl: string
}

export const getEntityName = (apiBaseUrl: string, url: string, namespace?: string) => {
  const regex = namespace
    ? new RegExp(`^${apiBaseUrl}\/${namespace}\/([^\?\/]*)`, 'i')
    : new RegExp(`^${apiBaseUrl}\/([^\?\/]*)`, 'i')
  const match = url.match(regex)
  return match ? match[1] : null
}

export const canUseCache = ({
  apiBaseUrl,
  originalUrl,
  includedCollections,
  includedGlobals,
  includedPaths
}: canUseCacheArgs) => {
  const collectionsEntityName = getEntityName(apiBaseUrl, originalUrl, '')
  const globalsEntityName = getEntityName(apiBaseUrl, originalUrl, 'globals')
  const pathEntityName = originalUrl.replace(apiBaseUrl, '')

  console.log(collectionsEntityName, globalsEntityName, pathEntityName)

  return (
    !originalUrl.includes('_preferences') &&
    (includedCollections.includes(collectionsEntityName) ||
      includedGlobals.includes(globalsEntityName) ||
      includedPaths.includes(pathEntityName))
  )
}
