const express = require('express')

const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
const logger = require('./utils/logger')
const config = require('./utils/config')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')

// morgan.token('content', (req) => JSON.stringify(req.body))

logger.info('Connecting to MongoDB...')
mongoose
  .connect(config.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })
app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))

app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)

module.exports = app
