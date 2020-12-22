const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

const initializeUsersDatabase = async (users) => {
  const userRequests = await users.map((user) =>
    api.post('/api/users').send(user)
  )
  await Promise.all(userRequests)
}
const initializeBlogsDatabase = async (initialBlogs) => {
  const users = await User.find({})

  const blogPromisesArray = []
  initialBlogs.forEach((blog) => {
    const authorUser = users.find((u) => u.name === blog.author)
    const blogToAdd = { ...blog, author: authorUser.id }
    const blogObject = new Blog(blogToAdd)
    blogPromisesArray.push(blogObject.save())
  })
  const resolvedBlogs = await Promise.all(blogPromisesArray)
  const userPromisesArray = []

  users.forEach((user) => {
    const blogstoAdd = resolvedBlogs
      .filter((blog) => user._id.toString() === blog.author.toString())
      .map((blog) => blog._id)
    user.blogs = user.blogs.concat(blogstoAdd)
    userPromisesArray.push(user)
  })
  await Promise.all(userPromisesArray)
}
// TODO : must refactor the beforeEach with Jest ways of handling asynchronous code

describe('BLOGS TESTS', () => {
  beforeEach(async () => {
    await helper.clearUsersDatabase()
    await helper.clearBlogsDatabase()

    await initializeUsersDatabase(helper.initialUsers)
    await initializeBlogsDatabase(helper.initialBlogs)

    // const users = await helper.usersInDb()
    // const blogs = await helper.blogsInDb()

    // console.log('users :>> ', users)
    // console.log('blogs :>> ', blogs)
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
      console.log('blogToGet :>> ', blogToGet)
      const response = await api.get(`/api/blogs/${blogToGet.id}`).expect(200)
      expect(response.body.id).toEqual(blogToGet.id)
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

describe('LOGIN TESTS', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const rootUser = {
      username: 'root',
      name: 'Superuser',
      password: 'toor'
    }
    await api.post('/api/users').send(rootUser)
  })
  test('login fails with bad username', async () => {
    const userLogin = { username: 'blob', password: 'falsePassword' }
    const response = await api.post('/api/login').send(userLogin).expect(401)
    expect(response.body.error).toEqual('invalid username or password')
  })
  test('login fails with no username or password ', async () => {
    const userLogin = { username: '', password: '' }
    const response = await api.post('/api/login').send(userLogin).expect(401)
    expect(response.body.error).toEqual('invalid username or password')
  })
  test('login fails with bad password', async () => {
    const userLogin = { username: 'root', password: 'falsePassword' }
    const response = await api.post('/api/login').send(userLogin).expect(401)
    expect(response.body.error).toEqual('invalid username or password')
  })
  test('login succeeds with good creditentials', async () => {
    const userLogin = { username: 'root', password: 'toor' }
    await api.post('/api/login').send(userLogin).expect(200)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
