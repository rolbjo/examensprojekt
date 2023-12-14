import cors from 'cors'
import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import { Client } from 'pg'

dotenv.config()

const client = new Client({
  connectionString: process.env.PGURI,
})

client.connect()

const app = express()

app.use(cors())

app.get('/data', (request, response) => {
  response.send('Hello Wefepfsergokerorld!')
})

app.use(express.static(path.join(path.resolve(), 'public')))

app.listen(3000, () => {
  console.log('Webbtjänsten kan nu ta emot anrop.')
})
