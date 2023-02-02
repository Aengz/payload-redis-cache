export const canUseCache = (
  entityName: string,
  includedCollections: string[],
  includedGlobals: string[]
) => {
  return (
    (includedCollections.includes(entityName) || includedGlobals.includes(entityName)) &&
    entityName !== '_preferences'
  )
}
