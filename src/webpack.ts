import { isFunction, isNil } from 'lodash'
import path from 'path'
import type { Config } from 'payload/config'
import type { Configuration as WebpackConfig } from 'webpack'
import type { PluginOptions } from './types'

interface ExtendWebpackConfigArgs {
  config: Config
  options: PluginOptions
}

export const extendWebpackConfig =
  (args: ExtendWebpackConfigArgs) =>
  (webpackConfig: WebpackConfig): WebpackConfig => {
    const {
      config: { admin }
    } = args
    const existingWebpackConfig =
      !isNil(admin) && isFunction(admin.webpack) ? admin.webpack(webpackConfig) : webpackConfig

    const adaptersPath = path.resolve(__dirname, 'adapters')
    const adaptersMock = path.resolve(__dirname, 'mocks/adapters')

    const newConfig: WebpackConfig = {
      ...existingWebpackConfig,
      resolve: {
        ...(existingWebpackConfig.resolve || {}),
        alias: {
          ...(existingWebpackConfig.resolve?.alias ? existingWebpackConfig.resolve.alias : {}),
          [adaptersPath]: adaptersMock
        }
      }
    }

    return newConfig
  }
