import path from 'path';
import { buildConfig } from 'payload/config';
// import Examples from './collections/Examples';
import Users from './collections/Users';
import { CachePlugin } from './plugins/cache/cache';

export default buildConfig({
  serverURL: 'http://localhost:3000',
  admin: {
    user: Users.slug,
  },
  collections: [
    Users,
    // Add Collections here
    // Examples,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [
    CachePlugin({redisURL: 'redis://localhost:6379'})
  ]
});
