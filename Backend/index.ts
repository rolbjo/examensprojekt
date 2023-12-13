import cors from 'cors'
import express from 'express'
import path from 'path'

const app = express()

app.use(cors())

app.get('/data', (request, response) => {
  response.send('Hello Wefepfsergokerorld!')
})

app.use(express.static(path.join(path.resolve(), 'public')))

app.listen(3000, () => {
  console.log('Webbtjänsten kan nu ta emot anrop.')
})
