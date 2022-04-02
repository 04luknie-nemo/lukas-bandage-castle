import express from 'express'
require('dotenv').config()
import authRoutes from './routes/auth'
import monsterRoutes from './routes/monsters'
import customerRoutes from './routes/customers'
import stayRoutes from './routes/stays'
import billingRoutes from './routes/billing'

const app = express()
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/monsters', monsterRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/stays', stayRoutes)
app.use('/api/billing', billingRoutes)

const port = process.env.PORT || 3001
app.listen(port, () => console.log('listening on ' + port))
