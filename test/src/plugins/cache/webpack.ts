import { isFunction } from 'lodash'
import type { Config } from 'payload/config'
import type { Configuration as WebpackConfig } from 'webpack'
import type { GeneratedAdapter, PluginOptions } from './types'

interface ExtendWebpackConfigArgs {
  config: Config
  options: PluginOptions
}

export const extendWebpackConfig = (args: ExtendWebpackConfigArgs) => (webpackConfig: WebpackConfig): WebpackConfig => {
    const { config: {admin}, options } = args
    const existingWebpackConfig = isFunction(admin?.webpack) ? admin.webpack(webpackConfig) : webpackConfig

    const newConfig: WebpackConfig = {
      ...existingWebpackConfig,
      resolve: {
        ...(existingWebpackConfig.resolve || {}),
        alias: {
          ...(existingWebpackConfig.resolve?.alias ? existingWebpackConfig.resolve.alias : {}),
        },
      },
    }

    return Object.entries(options.collections).reduce(
      (resultingWebpackConfig, [slug, collectionOptions]) => {
        const matchedCollection = config.collections?.find(coll => coll.slug === slug)

        if (matchedCollection && typeof collectionOptions.adapter === 'function') {
          const adapter: GeneratedAdapter = collectionOptions.adapter({
            collection: matchedCollection,
          })

          if (adapter.webpack) {
            return adapter.webpack(resultingWebpackConfig)
          }
        }

        return resultingWebpackConfig
      },
      newConfig,
    )
  }