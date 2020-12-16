require('dotenv').config()

const { PORT } = process.env
const { MONGO_URL } = process.env

module.exports = {
  PORT,
  MONGO_URL
}
