import * as dotenv from 'dotenv'
import express from 'express'
import payload from 'payload'
import { cacheMiddleware } from 'payload-redis-cache'
dotenv.config()

const app = express()

// Main middleware

app.use(cacheMiddleware)

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
