import { cachePlugin } from '@aengz/payload-redis-cache'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import path from 'path'
import { Config, buildConfig } from 'payload/config'
import Examples from './collections/Examples'
import Users from './collections/Users'

const config: Config = {
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    bundler: webpackBundler()
  },
  collections: [Users, Examples],
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || ''
  }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts')
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql')
  },
  plugins: [
    cachePlugin({ excludedCollections: ['users'] }) // ADD HERE
  ]
}

export default buildConfig(config)
