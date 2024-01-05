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

app.get('/data/destinations', async (req, res) => {
  try {
    const data = await client.query('SELECT * FROM destinations')

    console.log('the data.rows', data.rows)

    res.json(data.rows)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/data/:destination', async (req, res) => {
  try {
    const { destination } = req.params
    console.log('Destination Parameter:', destination)
    console.log('Destination Parameter:', destination, typeof destination)

    const data = await client.query(
      'SELECT * FROM destinations WHERE name = $1',
      [destination]
    )

    res.json(data.rows)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.use(express.static(path.join(path.resolve(), 'public')))

app.get('*', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'public', 'index.html'))
})

app.listen(3000, () => {
  console.log('Webbtjänsten kan nu ta emot anrop.')
})
