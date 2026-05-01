require('dotenv').config()

const { test, describe, before, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

before(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI)
})

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secreto123', 10)
  const user = new User({ username: 'RogiRP', name: 'Roger RP', passwordHash })
  await user.save()
})

after(async () => {
  await mongoose.connection.close()
})

describe('login', () => {

  test('succeeds with valid credentials and returns token', async () => {
    const credentials = {
      username: 'RogiRP',
      password: 'secreto123'
    }

    const response = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.ok(response.body.token)
    assert.strictEqual(response.body.username, 'RogiRP')
    assert.strictEqual(response.body.name, 'Roger RP')
  })

  test('fails with 401 if password is wrong', async () => {
    const credentials = {
      username: 'RogiRP',
      password: 'wrongpassword'
    }

    const response = await api
      .post('/api/login')
      .send(credentials)
      .expect(401)

    assert.ok(response.body.error.includes('invalid username or password'))
    assert.strictEqual(response.body.token, undefined)
  })

  test('fails with 401 if username does not exist', async () => {
    const credentials = {
      username: 'nonexistent',
      password: 'secreto123'
    }

    const response = await api
      .post('/api/login')
      .send(credentials)
      .expect(401)

    assert.ok(response.body.error.includes('invalid username or password'))
  })

})

describe('creating a blog with authentication', () => {

  const loginAndGetToken = async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'RogiRP', password: 'secreto123' })
    return response.body.token
  }

  test('succeeds with valid token', async () => {
    const token = await loginAndGetToken()

    const newBlog = {
      title: 'Blog con autenticacion',
      author: 'Roger',
      url: 'test.com',
      likes: 3
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.title, 'Blog con autenticacion')
    assert.ok(response.body.user)  
  })

  test('fails with 401 if token is missing', async () => {
    const newBlog = {
      title: 'Blog sin token',
      author: 'Roger',
      url: 'test.com'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    assert.ok(response.body.error.includes('token invalid'))
  })

  test('fails with 401 if token is invalid', async () => {
    const newBlog = {
      title: 'Blog con token falso',
      author: 'Roger',
      url: 'test.com'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer tokenfalso123')
      .send(newBlog)
      .expect(401)

    assert.ok(response.body.error.includes('token invalid'))
  })

})