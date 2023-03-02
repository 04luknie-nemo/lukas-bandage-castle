import path from 'path'
import { config } from 'dotenv'

// There is one .env for the whole repo, at the root (Prisma reads it from there too).
config({ path: path.resolve(__dirname, '../../../.env') })
