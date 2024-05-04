import cors from 'cors'
import express from 'express'
import { Request, Response, NextFunction } from 'express'
import path from 'path'
import dotenv from 'dotenv'
import { Client } from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

const client = new Client({
  connectionString: process.env.PGURI,
})

client.connect()

const app = express()

app.use(cors())
app.use(express.json())

const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split(' ')[1]

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403)
      }

      req.user = user
      next()
    })
  } else {
    res.sendStatus(401)
  }
}

app.post('/register', async (req, res) => {
  console.log('Register request:', req.body)
  try {
    const { username, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const queryText = `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING *;
    `

    const values = [username, hashedPassword]

    const newUser = await client.query(queryText, values)
    console.log('Register response:', newUser.rows[0])
    res.json(newUser.rows[0])
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    const queryText = 'SELECT * FROM users WHERE username = $1'
    const values = [username]

    const user = await client.query(queryText, values)

    if (user.rows.length > 0) {
      const passwordMatch = await bcrypt.compare(
        password,
        user.rows[0].password
      )
      if (passwordMatch) {
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET is not defined')
        }
        const token = jwt.sign(
          { id: user.rows[0].id, username: user.rows[0].username },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        )
        console.log('Login response:', 'Logged in', token)
        res.json({ message: 'Logged in', token })
      } else {
        res.status(401).json({ error: 'Incorrect password' })
      }
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/data/destinations', jwtMiddleware, async (req, res) => {
  console.log('Headers:', req.headers)
  try {
    const { query } = req.query

    let queryText = 'SELECT * FROM destinations'

    if (query) {
      queryText += ` WHERE name ILIKE '%${query}%'`
    }

    const data = await client.query<Destination>(queryText)
    console.log('Response data:', data)
    res.json(data.rows)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/data/:destination', jwtMiddleware, async (req, res) => {
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

app.get('/trips', jwtMiddleware, async (req, res) => {
  try {
    const result = await client.query<Trip>(
      'SELECT * FROM trips WHERE user_id = $1',
      [req.user.id]
    )

    const trips = result.rows

    res.json(trips)
  } catch (error) {
    console.error('Error fetching saved trips:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/data/saveTrip', jwtMiddleware, async (req, res) => {
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

    if (!req.user || !req.user.id) {
      console.error('Invalid user data:', req.user)
      return res.status(400).json({ error: 'Invalid user data' })
    }

    const queryText = `
        INSERT INTO trips (destination, start_date, end_date, user_id)
        VALUES ($1, TO_DATE($2, 'YYYY-MM-DD'), TO_DATE($3, 'YYYY-MM-DD'),$4)
        RETURNING *;
      `

    const values = [
      tripData.destination,
      tripData.startDate,
      tripData.endDate,
      req.user.id,
    ]

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
