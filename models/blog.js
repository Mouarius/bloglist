const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

// eslint-disable-next-line new-cap
const Blog = new mongoose.model('Blog', blogSchema)

module.exports = Blog
