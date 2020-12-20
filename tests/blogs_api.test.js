const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

describe('NOTES TESTS', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog))
    const promiseArray = blogObjects.map((blog) => blog.save())
    await Promise.all(promiseArray)
  })
  describe('getting blogs content', () => {
    test('blogs are returned as JSON', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    test('all blogs are returned', async () => {
      const response = await api.get('/api/blogs')
      expect(response.body).toHaveLength(helper.initialBlogs.length)
    })
    test('a specific blog can be returned', async () => {
      const blogs = await helper.blogsInDb()
      const blogToGet = blogs[0]
      const response = await api.get(`/api/blogs/${blogToGet.id}`).expect(200)
      expect(response.body).toEqual(blogToGet)
    })
  })
  describe('structure of database', () => {
    test('id should be defined', async () => {
      const response = await api.get('/api/blogs')
      expect(response.body[0].id).toBeDefined()
    })
    test('__v and _id shoud not exist', async () => {
      const response = await api.get('/api/blogs')
      // eslint-disable-next-line no-underscore-dangle
      expect(response.body[0].__v).toBeUndefined()
      // eslint-disable-next-line no-underscore-dangle
      expect(response.body[0]._id).toBeUndefined()
    })
  })

  describe('adding new blogs', () => {
    test('a new blog can be added', async () => {
      const blogToAdd = {
        title: 'Added blog',
        author: 'Marius Menault',
        url: 'https://localhost',
        likes: 0
      }
      await api
        .post('/api/blogs')
        .send(blogToAdd)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const blogsInDb = await helper.blogsInDb()
      expect(blogsInDb).toHaveLength(helper.initialBlogs.length + 1)
      const blogsTitle = blogsInDb.map((blog) => blog.title)
      expect(blogsTitle).toContain(blogToAdd.title)
    })
    test('a blog with no title is not added', async () => {
      const blogWithoutTitle = {
        author: 'Marius Menault',
        url: 'http://localhost',
        likes: 0
      }
      await api.post('/api/blogs').send(blogWithoutTitle).expect(400)
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })
    test('a blog with no url is not added', async () => {
      const blogWithoutTitle = {
        title: 'Added blog',
        author: 'Marius Menault',
        likes: 0
      }
      await api.post('/api/blogs').send(blogWithoutTitle).expect(400)
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })
  })
  describe('deleting blogs', () => {
    test('a post can be deleted', async () => {
      const blogs = await helper.blogsInDb()
      const blogToDelete = blogs[0]
      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

      const blogsAtEndTitles = blogsAtEnd.map((blog) => blog.title)
      expect(blogsAtEndTitles).not.toContain(blogs[0].title)
    })
  })
  describe('modifying blog content', () => {
    test('modify the number of likes only ', async () => {
      const blogs = await helper.blogsInDb()
      const blogToUpdate = blogs[0]
      const updatedBlog = {
        likes: 100
      }
      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
      const blogsAtEnd = await helper.blogsInDb()
      const blogsAtEndLikes = blogsAtEnd.map((blog) => blog.likes)
      expect(blogsAtEndLikes[0]).toBe(100)
    })
    test('modify the title only', async () => {
      const blogs = await helper.blogsInDb()
      const blogToUpdate = blogs[0]
      const updatedBlog = {
        title: 'new title'
      }
      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
      const blogsAtEnd = await helper.blogsInDb()
      const blogsAtEndTitles = blogsAtEnd.map((blog) => blog.title)
      expect(blogsAtEndTitles[0]).toBe('new title')
    })
    test('modify the title and number of likes', async () => {
      const blogs = await helper.blogsInDb()
      const blogToUpdate = blogs[0]
      const updatedBlog = {
        title: 'new title',
        likes: 100
      }
      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
      const blogsAtEnd = await helper.blogsInDb()
      const blogsAtEndTitles = blogsAtEnd.map((blog) => blog.title)
      const blogsAtEndLikes = blogsAtEnd.map((blog) => blog.likes)

      expect(blogsAtEndTitles[0]).toBe('new title')
      expect(blogsAtEndLikes[0]).toBe(100)
    })
  })
})

describe('USERS TESTS', () => {
  describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
      const passwordHash = await bcrypt.hash('toor', 10)
      const rootUser = new User({
        username: 'root',
        name: 'Superuser',
        passwordHash
      })
      await rootUser.save()
    })
    test('get all users', async () => {
      const response = await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const usersAtEnd = await helper.usersInDb()

      expect(JSON.stringify(response.body)).toEqual(JSON.stringify(usersAtEnd))
    })
    test('create a new user', async () => {
      const newUser = {
        username: 'mouarius',
        name: 'Marius Menault',
        password: 'motdepasse'
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(2)
      const usernames = await usersAtEnd.map((user) => user.username)
      expect(usernames).toContain('mouarius')
    })
    test('a user with the same username cannot be created', async () => {
      const usersAtStart = await helper.usersInDb()
      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'toor'
      }
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('`username` to be unique')

      const usersAtEnd = await helper.usersInDb()

      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
