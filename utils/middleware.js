const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  let token = null
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    token = authorization.substring(7)
  }
  request.token = token
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}
const errorHandler = (error, request, response, next) => {
  if (error.name === 'ValidationError') {
    response.status(400).json({ error: error.message })
  }
  if (error.name === 'JsonWebTokenError') {
    response.status(401).json({ error: 'invalid token' })
  }
  next(error)
}
module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
}
