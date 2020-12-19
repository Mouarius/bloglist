const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.use('/', (req, res, next) => {
  next()
})

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.status(200).json(blogs)
})
blogsRouter.get('/:id', async (request, response) => {
  const { id } = request.params
  const blogToGet = await Blog.findById(id)
  response.status(200).json(blogToGet)
})
blogsRouter.post('/', async (request, response) => {
  const blogToAdd = new Blog(request.body)
  await blogToAdd.save()
  response.status(201).json(blogToAdd)
})
blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params
  await Blog.findByIdAndRemove(id)
  response.status(204).end()
})
module.exports = blogsRouter
