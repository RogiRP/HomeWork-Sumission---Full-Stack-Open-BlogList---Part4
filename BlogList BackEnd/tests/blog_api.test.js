require('dotenv').config()

const { test, describe, beforeEach, before, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const mongoose = require('mongoose')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'First blog',
    author: 'Roger',
    url: 'test.com',
    likes: 5
  },
  {
    title: 'Second blog',
    author: 'Roger',
    url: 'test.com',
    likes: 10
  }
]

before(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI)
})

beforeEach(async () => {
    await Blog.deleteMany({})

    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()

    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})


after(async () => {
  await mongoose.connection.close()
})


describe('blog api', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, initialBlogs.length)
  })

})