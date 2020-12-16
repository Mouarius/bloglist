const listHelper = require('../utils/list_helper')
const blogs = require('./blogsSample')

const blogsEmpty = []

test('dummy should be one', () => {
  expect(listHelper.dummy(blogsEmpty)).toBe(1)
})

describe('Test the total likes', () => {
  const { totalLikes } = listHelper
  test('total likes sould be 0', () => {
    expect(totalLikes(blogsEmpty)).toBe(0)
  })

  test('total likes shoud be 36', () => {
    expect(totalLikes(blogs)).toBe(36)
  })
})

describe('Test favorite post', () => {
  const { favoriteBlog } = listHelper
  test('favorite post shoud be null', () => {
    expect(favoriteBlog(blogsEmpty)).toBe(null)
  })
  test('favorite blog should be the third one', () => {
    const theFavoriteBlog = favoriteBlog(blogs)
    const expectedBlog = blogs[2]
    expect(theFavoriteBlog).toEqual(expectedBlog)
  })
})

describe('Author with most blogs', () => {
  const { mostBlogs } = listHelper

  test('must return null', () => {
    expect(mostBlogs([])).toBe(null)
  })

  test('must return Robert C. Martin, 3', () => {
    expect(mostBlogs(blogs)).toEqual({ author: 'Robert C. Martin', count: 3 })
  })
})
describe('Author with most likes', () => {
  const { mostLikes } = listHelper

  test('must return null', () => {
    expect(mostLikes([])).toBe(null)
  })

  test('must return Edsger W. Dijkstra, 17', () => {
    expect(mostLikes(blogs)).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17
    })
  })
})
