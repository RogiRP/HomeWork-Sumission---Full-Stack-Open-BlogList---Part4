//Autentificacion resuelta anteriormente

require('dotenv').config()

const { test, describe, beforeEach, before, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/user')

let token

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
    await User.deleteMany({})
    
    const passwordHash = await bcrypt.hash('password123', 10)
    const user = new User({ username: 'testuser', name: 'Test User', passwordHash })
    await user.save()

    const response = await api
      .post('/api/login')
      .send({ username: 'testuser', password: 'password123' })
    token = response.body.token


    let blogObject = new Blog({ ...initialBlogs[0], user: user._id })
    await blogObject.save()

    blogObject = new Blog({ ...initialBlogs[1], user: user._id })
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
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

    assert.strictEqual(response.body.likes, 0)

  })

  test('blog without title is not added and returns 400', async () => {
    const blogWithoutTitle = {
        author: 'Roger',
        url: 'test.com',
        likes: 5
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogWithoutTitle)
        .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
    })

  test('blog without url is not added and returns 400', async () => {
    const blogWithoutUrl = {
        title: 'Blog without url',
        author: 'Roger',
        likes: 5
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogWithoutUrl)
        .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
    })
})

describe('deletion of a blog', () => {

  test('succeeds with status 204 if id is valid', async () => {
        const blogsAtStart = await api.get('/api/blogs')
    const blogToDelete = blogsAtStart.body[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length - 1)

    const titles = blogsAtEnd.body.map(b => b.title)
    assert.ok(!titles.includes(blogToDelete.title))
  })

  test('fails with status 404 if blog does not exist', async () => {
    const nonExistingId = '000000000000000000000000'

    await api
      .delete(`/api/blogs/${nonExistingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

})

describe('updating a blog', () => {

  test('succeeds updating likes with status 200', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]

    const updatedData = { likes: 999 }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, 999)
  })

  test('fails with status 404 if blog does not exist', async () => {
    const nonExistingId = '000000000000000000000000'

    await api
      .put(`/api/blogs/${nonExistingId}`)
      .send({ likes: 999 })
      .expect(404)
  })

})