import { CollectionConfig } from 'payload/types'

// Example Collection - For reference only, this must be added to payload.config.ts to be used.
const Examples: CollectionConfig = {
  slug: 'examples',
  admin: {
    useAsTitle: 'someField'
  },
  hooks: {
    afterRead: [
      () => {
        console.log('>> Reading from DB')
      }
    ]
  },
  fields: [
    {
      name: 'someField',
      type: 'text'
    }
  ]
}

export default Examples
