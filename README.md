# test

This project was created using create-payload-app using the ts-blank template.

## How to Use

`PAYLOAD_SECRET=secret MONGODB_URI=mongodb://localhost:27117/dev yarn dev` will start up your application and reload on any changes.

If you have docker and docker-compose installed, you can run `docker-compose up`

# Dev testing library

Build the lib `yarn build && npm pack`
Test on the dev project ` cd dev && yarn add ../payload-redis-cache-1.0.0.tgz && PAYLOAD_SECRET=secret MONGODB_URI=mongodb://localhost:27117/dev yarn dev`
