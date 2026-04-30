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