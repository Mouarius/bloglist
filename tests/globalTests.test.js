const listHelper = require('../utils/list_helper')
const blogs = require('./blogsSample')

test('dummy should be one', () => {
  const blogsEmpty = []
  expect(listHelper.dummy(blogsEmpty)).toBe(1)
})

describe('Test the total likes', () => {
  const { totalLikes } = listHelper
  test('total likes sould be 0', () => {
    const blogsEmpty = []
    expect(totalLikes(blogsEmpty)).toBe(0)
  })

  test('total likes shoud be 36', () => {
    expect(totalLikes(blogs)).toBe(36)
  })
})

describe('Test favorite post', () => {
  const { favoriteBlog } = listHelper
  test('favorite post shoud be null', () => {
    const blogsEmpty = []
    expect(favoriteBlog(blogsEmpty)).toBe(null)
  })
  test('favorite blog should be the third one', () => {
    const theFavoriteBlog = favoriteBlog(blogs)
    const expectedBlog = blogs[2]
    expect(theFavoriteBlog).toEqual(expectedBlog)
  })
})
