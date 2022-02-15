// @ts-nocheck
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2')

const sql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8')
const conn = mysql.createConnection({ uri: process.env.DATABASE_URL, multipleStatements: true })

conn.query(sql, (err) => {
  if (err) {
    console.log('failed', err)
    process.exit(1)
  }
  console.log('db ready')
  conn.end()
})
