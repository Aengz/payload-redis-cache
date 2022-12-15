import { Config } from 'payload/config';
import { getCache, upsertCache } from './cache.hooks';
import { PluginOptions } from './types';


export const CachePlugin = 
  (pluginOptions: PluginOptions) => 
  (incomingConfig: Config): Config => {
    const {redisUrl} = pluginOptions
    const collections = incomingConfig.collections.map((collection) => {
        return {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [
                ...collection.hooks.afterChange,
                upsertCache(redisUrl)
            ],
            beforeOperation: [
                ...collection.hooks.beforeOperation,
                getCache(redisUrl)
            ]
          }
        };
      }
    )

    const config: Config = {
        ...incomingConfig,
        collections};
    
    return {
      ...config,
      
    };
}