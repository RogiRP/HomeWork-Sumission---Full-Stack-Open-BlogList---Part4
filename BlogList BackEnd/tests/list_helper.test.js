const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {

  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const blogs = [
      {
        likes: 5
      }
    ]

    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    const blogs = [
      { likes: 5 },
      { likes: 3 },
      { likes: 7 }
    ]

    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 15)
  })

})

describe('favorite blog', () => {

  test('of empty list is null', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, null)
  })

  test('when list has only one blog, returns that blog', () => {
    const blogs = [
      {
        title: "Test",
        author: "Roger",
        likes: 5
      }
    ]

    const result = listHelper.favoriteBlog(blogs)

    assert.deepStrictEqual(result, {
      title: "Test",
      author: "Roger",
      likes: 5
    })
  })

  test('of a bigger list, returns blog with most likes', () => {
    const blogs = [
      { title: "A", author: "X", likes: 5 },
      { title: "B", author: "Y", likes: 10 },
      { title: "C", author: "Z", likes: 7 }
    ]

    const result = listHelper.favoriteBlog(blogs)

    assert.deepStrictEqual(result, {
      title: "B",
      author: "Y",
      likes: 10
    })
  })

})

describe('most blogs', () => {

  test('of empty list is null', () => {
    const result = listHelper.mostBlogs([])
    assert.strictEqual(result, null)
  })

  test('when list has only one blog, returns that author', () => {
    const blogs = [
      { author: "Roger" }
    ]

    const result = listHelper.mostBlogs(blogs)

    assert.deepStrictEqual(result, {
      author: "Roger",
      blogs: 1
    })
  })

  test('of a bigger list, returns author with most blogs', () => {
    const blogs = [
      { author: "A" },
      { author: "B" },
      { author: "A" },
      { author: "C" },
      { author: "A" },
      { author: "B" }
    ]

    const result = listHelper.mostBlogs(blogs)

    assert.deepStrictEqual(result, {
      author: "A",
      blogs: 3
    })
  })
})

describe('most likes', () => {

  test('of empty list is null', () => {
    const result = listHelper.mostLikes([])
    assert.strictEqual(result, null)
  })

  test('when list has only one blog, returns that author', () => {
    const blogs = [
      { author: "Roger", likes: 5 }
    ]

    const result = listHelper.mostLikes(blogs)

    assert.deepStrictEqual(result, {
      author: "Roger",
      likes: 5
    })
  })

  test('of a bigger list, returns author with most likes', () => {
    const blogs = [
      { author: "A", likes: 5 },
      { author: "B", likes: 10 },
      { author: "A", likes: 7 },
      { author: "B", likes: 3 }
    ]

    const result = listHelper.mostLikes(blogs)

    assert.deepStrictEqual(result, {
      author: "B",
      likes: 13
    })
  })

})