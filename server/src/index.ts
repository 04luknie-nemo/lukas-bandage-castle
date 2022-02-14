import express from 'express'
require('dotenv').config()

const app = express()
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log('listening on ' + port))
