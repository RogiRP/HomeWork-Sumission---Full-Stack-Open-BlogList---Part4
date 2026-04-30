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