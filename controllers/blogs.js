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
blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params
  const { body } = request
  const existingBlog = await Blog.findById(id)
  const updatedBlog = {
    title: body.title ? body.title : existingBlog.title,
    author: body.author ? body.author : existingBlog.author,
    url: body.url ? body.url : existingBlog.url,
    likes: body.likes ? body.likes : existingBlog.likes
  }
  await Blog.findByIdAndUpdate(id, updatedBlog, { new: true })
  response.status(200).json(updatedBlog)
})
module.exports = blogsRouter
