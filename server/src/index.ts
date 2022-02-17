import express from 'express'
require('dotenv').config()
import authRoutes from './routes/auth'

const app = express()
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)

const port = process.env.PORT || 3001
app.listen(port, () => console.log('listening on ' + port))
