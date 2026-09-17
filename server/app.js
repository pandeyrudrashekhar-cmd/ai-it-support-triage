require('dotenv').config()

const express = require('express')
const cors = require('cors')
const triageRoutes = require('./routes/triageRoutes')

const app = express()
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-it-support-triage',
  })
})

app.use('/api/triage', triageRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found.',
  })
})

app.use((error, req, res, next) => {
  console.error('Unhandled server error:', error)
  res.status(500).json({
    success: false,
    error: 'Unable to process the triage request right now.',
  })
})

module.exports = app
