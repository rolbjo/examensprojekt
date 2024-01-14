import cors from 'cors'
import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import { Client } from 'pg'

dotenv.config()

interface Destination {
  id: number
  name: string
  sights: string[]
  when_to_travel: string[]
  img: string
}

interface Trip {
  id: number
  destination: string
  start_date: string
  end_date: string
}

const client = new Client({
  connectionString: process.env.PGURI,
})

client.connect()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/data/destinations', async (req, res) => {
  try {
    const { query } = req.query

    let queryText = 'SELECT * FROM destinations'

    if (query) {
      queryText += ` WHERE name ILIKE '%${query}%'`
    }

    const data = await client.query<Destination>(queryText)

    res.json(data.rows)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/data/:destination', async (req, res) => {
  try {
    const { destination } = req.params as { destination: string }

    const data = await client.query<Destination>(
      'SELECT * FROM destinations WHERE name = $1',
      [destination]
    )

    res.json(data.rows)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/trips', async (req, res) => {
  try {
    const result = await client.query<Trip>('SELECT * FROM trips')

    const trips = result.rows

    res.json(trips)
  } catch (error) {
    console.error('Error fetching saved trips:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/data/saveTrip', async (req, res) => {
  try {
    const tripData = req.body
    console.log('Received trip data:', tripData)

    if (
      !tripData ||
      !tripData.destination ||
      !tripData.startDate ||
      !tripData.endDate
    ) {
      return res.status(400).json({ error: 'Invalid trip data' })
    }

    const queryText = `
        INSERT INTO trips (destination, start_date, end_date)
        VALUES ($1, TO_DATE($2, 'YYYY-MM-DD'), TO_DATE($3, 'YYYY-MM-DD'))
        RETURNING *;
      `

    const values = [tripData.destination, tripData.startDate, tripData.endDate]

    const savedTrip = await client.query<Trip>(queryText, values)

    res.json(savedTrip.rows[0])
  } catch (error) {
    console.error('Error saving trip:', error)
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
