const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { body } = request
  const userToLogin = await User.findOne({ username: body.username })
  if (userToLogin) {
    const passwordIsCorrect = await bcrypt.compare(
      body.password,
      userToLogin.passwordHash
    )
    if (passwordIsCorrect) {
      const userForToken = {
        username: userToLogin.username,
        id: userToLogin._id
      }
      const token = await jwt.sign(userForToken, process.env.SECRET)
      return response
        .status(200)
        .json({
          token,
          username: userToLogin.username,
          name: userToLogin.name,
          id: userToLogin._id
        })
    }
  }
  return response.status(401).json({ error: 'invalid username or password' })
})

module.exports = loginRouter
