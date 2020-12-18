require('dotenv').config()

const { PORT } = process.env
let { MONGO_URL } = process.env

if (process.env.NODE_ENV === 'test') {
  MONGO_URL = process.env.TEST_MONGO_URL
}

module.exports = {
  PORT,
  MONGO_URL
}
