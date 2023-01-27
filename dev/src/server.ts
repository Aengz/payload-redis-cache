import { initRedis } from '@aengz/payload-redis-cache'
import * as dotenv from 'dotenv'
import express from 'express'
import payload from 'payload'
dotenv.config()

const app = express()

// Init resid connection
initRedis({
  redisUrl: process.env.REDIS_URI
})

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

// Initialize Payload
payload.init({
  secret: process.env.PAYLOAD_SECRET || '',
  mongoURL: process.env.MONGODB_URI || '',
  express: app,
  onInit: () => {
    console.log(`Payload Admin URL: ${payload.getAdminURL()}`)
  }
})

// Add your own express routes here

app.listen(3000)
