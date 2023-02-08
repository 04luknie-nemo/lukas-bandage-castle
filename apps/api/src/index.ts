import 'dotenv/config'
import { createApp } from './app'
import { startRavenLoop } from './legacy'

const port = Number(process.env.PORT) || 3001

createApp().listen(port, () => {
  console.log(`Bandage Castle API listening on http://localhost:${port}`)
  startRavenLoop()
})
