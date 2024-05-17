import cors from 'cors'
import express from 'express'
import { Request, Response, NextFunction } from 'express'
import path from 'path'
import dotenv from 'dotenv'
import { Client } from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from 'multer'

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
  },
})
const upload = multer({ storage: storage })

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

    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }

    // Generate a JWT token for the new user
    const token = jwt.sign(
      { id: newUser.rows[0].id, username: newUser.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Send the new user data along with the token
    res.json({ user: newUser.rows[0], token })
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

app.post('/api/recommended', async (req, res) => {
  try {
    const userChoices = req.body

    let bestMatches = []
    let bestScore = -1

    const destinations = await client.query('SELECT * FROM recommended')

    for (const destination of destinations.rows) {
      if (destination.continent !== userChoices.continent) {
        continue
      }
      let score = 0
      for (const choice in userChoices) {
        if (destination[choice] === userChoices[choice]) {
          score++
        }
      }
      if (score > bestScore) {
        bestMatches = [destination]
        bestScore = score
      } else if (score === bestScore) {
        bestMatches.push(destination)
      }
    }

    if (bestMatches.length > 0) {
      // Select a random destination from the best matches
      const randomIndex = Math.floor(Math.random() * bestMatches.length)
      res.json(bestMatches[randomIndex])
    } else {
      res.status(404).json({ error: 'No matching destination found' })
    }
  } catch (error) {
    console.error('Error finding best match:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post(
  '/api/saveBlogPost',
  upload.single('image'),
  jwtMiddleware,
  async (req, res) => {
    try {
      const postData = req.body

      if (!postData || !postData.title || !postData.description || !req.file) {
        console.error(
          'Invalid blog post data:',
          postData,
          'req.file:',
          req.file
        )
        return res.status(400).json({ error: 'Invalid blog post data' })
      }

      const imagePath = req.file.path // Get the path to the image file

      const queryText = `
      INSERT INTO blog_posts (title, description, image, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `

      const values = [
        postData.title,
        postData.description,
        imagePath,
        req.user.id,
      ] // Store the image path in the database

      // Assuming 'client' is your PostgreSQL client
      const result = await client.query(queryText, values)

      if (result.rows && result.rows.length > 0) {
        res.json(result.rows[0]) // Send the inserted row back to the client
      } else {
        throw new Error('Insert operation did not return any rows')
      }
    } catch (error) {
      console.error('Error saving blog post:', error)
      console.error('Request body:', req.body)
      console.error('File:', req.file)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

app.get('/api/blogPosts', async (req, res) => {
  try {
    const queryText = 'SELECT * FROM blog_posts'

    const blogPostsResult = await client.query(queryText)
    const blogPosts = blogPostsResult.rows

    for (let post of blogPosts) {
      const commentResult = await client.query(
        'SELECT comments.*, users.username FROM comments INNER JOIN users ON comments.user_id = users.id WHERE post_id = $1',
        [post.id]
      )
      post.comments = commentResult.rows

      for (let comment of post.comments) {
        const replyResult = await client.query(
          'SELECT replies.*, users.username FROM replies INNER JOIN users ON replies.user_id = users.id WHERE comment_id = $1',
          [comment.id]
        )
        console.log('Reply Result:', replyResult) // Log the result of the query
        comment.replies = replyResult.rows
        console.log('heeeej:', comment)
      }
    }

    res.json(blogPosts) // Send the blog posts with comments and replies back as a JSON response
    console.log('Blog posts:', blogPosts)
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ message: 'An error occurred while fetching blog posts' })
  }
})

app.post('/api/comments', jwtMiddleware, async (req, res) => {
  const { content, post_id } = req.body
  const user_id = req.user.id

  try {
    const result = await client.query(
      `INSERT INTO comments (content, post_id, user_id) VALUES ($1, $2, $3)
       RETURNING *, (SELECT username FROM users WHERE id = $3) as username`,
      [content, post_id, user_id]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: 'An error occurred while creating the comment' })
  }
})

app.post('/api/replies', jwtMiddleware, async (req, res) => {
  const { content, comment_id, parent_id } = req.body
  const user_id = req.user.id

  try {
    // Check if the comment exists
    const commentResult = await client.query(
      'SELECT * FROM comments WHERE id = $1',
      [comment_id]
    )

    if (commentResult.rows.length === 0) {
      return res.status(400).json({
        error: 'The comment you are trying to reply to does not exist',
      })
    }

    const result = await client.query(
      'INSERT INTO replies (content, comment_id, user_id, parent_id) VALUES ($1, $2, $3, $4) RETURNING *, (SELECT username FROM users WHERE id = $3) as username',
      [content, comment_id, user_id, parent_id]
    )
    console.log('hehhehee', result)

    result.rows[0].description = result.rows[0].description.replace(
      /\\n/g,
      '\n'
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: 'An error occurred while creating the reply' })
  }
})

app.post('/api/tripDetails', jwtMiddleware, async (req, res) => {
  const { tripName, tripDescription } = req.body
  const user_id = req.user.id

  const modifiedTripDescription = tripDescription.replace(/\n/g, '\\n')

  console.log('Received tripDescription:', tripDescription)

  try {
    // Insert the trip name, trip description, and user_id into the trip_details table
    const result = await client.query(
      'INSERT INTO trip_details (tripname, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [tripName, modifiedTripDescription, user_id]
    )

    res.json(result.rows[0])
    console.log('Trip details:', result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'An error occurred while creating the trip' })
  }
})

app.get('/api/userTrips', jwtMiddleware, async (req, res) => {
  const user_id = req.user.id

  try {
    const result = await client.query(
      'SELECT * FROM trip_details WHERE user_id = $1 ORDER BY id DESC',
      [user_id]
    )

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the trip details' })
  }
})

app.get('/api/tripDetails/:tripId', jwtMiddleware, async (req, res) => {
  const { tripId } = req.params

  try {
    const result = await client.query(
      'SELECT * FROM trip_details WHERE id = $1',
      [tripId]
    )

    if (result.rows.length > 0) {
      res.json(result.rows[0])
    } else {
      res.status(404).json({ error: 'Trip not found' })
    }
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the trip details' })
  }
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(express.static(path.join(path.resolve(), 'public')))

app.get('*', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'public', 'index.html'))
})

app.listen(3000, () => {
  console.log('Webbtjänsten kan nu ta emot anrop.')
})
