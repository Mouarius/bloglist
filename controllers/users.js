const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, url: 1 })
  response.status(200).json(users)
})

usersRouter.post('/', async (request, response) => {
  const { body } = request
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)
  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash
  })
  await user.save()
  response.status(201).json(user)
})

module.exports = usersRouter
