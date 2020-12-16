const dummy = (blogs) => 1

const totalLikes = (blogs) => {
  const sumReducer = (accumulator, currentValue) =>
    accumulator + currentValue.likes
  return blogs.reduce(sumReducer, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  let maxLikes = 0
  for (let i = 0; i < blogs.length; i += 1) {
    const blog = blogs[i]
    if (blog.likes >= maxLikes) {
      maxLikes = blog.likes
    }
  }
  return blogs.find((blog) => blog.likes === maxLikes)
}

module.exports = { dummy, totalLikes, favoriteBlog }
