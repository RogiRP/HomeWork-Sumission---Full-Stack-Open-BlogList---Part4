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

  test('unique identifier is named id', async() => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]

    assert.ok(blog.id !== undefined)
    assert.strictEqual(blog._id, undefined)
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
        title: 'Third blog',
        author: 'Roger',
        url: 'Roronoa.com',
        likes: 3
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length + 1)

    const titles = response.body.map(b => b.title)
    assert.ok(titles.includes('Third blog'))
  })

  test('blog without likes defaults to 0', async () => {
    const newBlog = {
        title: 'Blog without likes',
        author: 'Roger',
        url: 'test.com'
    }

    const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    assert.strictEqual(response.body.likes, 0)
    
  })

})