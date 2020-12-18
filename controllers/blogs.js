const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.use('/', (req, res, next) => {
  next()
})

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.status(200).json(blogs)
})

blogsRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)

  blog.save().then((result) => response.status(201).json(result))
})

module.exports = blogsRouter
