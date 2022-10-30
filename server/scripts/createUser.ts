// @ts-nocheck
// usage: npm run create-user -- email password ROLE
require('dotenv').config()
const bcrypt = require('bcryptjs')
const mysql = require('mysql2/promise')

async function main() {
  const [email, password, role] = process.argv.slice(2)
  if (!email || !password) {
    console.log('usage: npm run create-user -- email password [ROLE]')
    process.exit(1)
  }
  const conn = await mysql.createConnection(process.env.DATABASE_URL)
  const hash = await bcrypt.hash(password, 10)
  await conn.query('INSERT INTO tbl_user (email, password_hash, role, display_name) VALUES (?,?,?,?)', [email, hash, role || 'STAFF', email.split('@')[0]])
  console.log('created ' + email)
  await conn.end()
}

main()
