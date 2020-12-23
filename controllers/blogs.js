const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('author', { username: 1, name: 1 })
  response.status(200).json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const { id } = request.params
  const blogToGet = await Blog.findById(id)
  response.status(200).json(blogToGet)
})

blogsRouter.post('/', async (request, response) => {
  const { body } = request
  const { token } = request
  const decodedToken = await jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token is missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const blogToAdd = new Blog({
    title: body.title,
    url: body.url,
    likes: body.likes,
    author: user._id
  })
  const savedBlog = await blogToAdd.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  return response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params
  const { token } = request
  const decodedToken = await jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token is missing or invalid' })
  }
  await Blog.findByIdAndRemove(id)
  const user = await User.findOne({ username: decodedToken.username })
  user.blogs = user.blogs.filter((blog) => blog.toString() !== id.toString())
  await user.save()
  return response.status(204).end()
})
module.exports = blogsRouter
