import path from 'path'
import type { Config } from 'payload/config'
import type { Configuration as WebpackConfig } from 'webpack'
import type { PluginOptions } from './types'

interface ExtendWebpackConfigArgs {
  config: Config
  options?: PluginOptions
}

export const extendWebpackConfig =
  (args: ExtendWebpackConfigArgs) =>
  (webpackConfig: WebpackConfig): WebpackConfig => {
    const { config: originalConfig } = args
    const existingWebpackConfig =
      typeof originalConfig.admin?.webpack === 'function'
        ? originalConfig.admin.webpack(webpackConfig)
        : webpackConfig

    const adaptersPath = path.resolve(__dirname, 'cacheAdapters')
    const adaptersMock = path.resolve(__dirname, 'cacheAdaptersMocks')

    const config: WebpackConfig = {
      ...existingWebpackConfig,
      resolve: {
        ...(existingWebpackConfig.resolve || {}),
        alias: {
          ...(existingWebpackConfig.resolve?.alias || {}),
          [adaptersPath]: adaptersMock
        }
      }
    }

    return config
  }
