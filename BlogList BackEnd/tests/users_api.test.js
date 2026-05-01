require('dotenv').config()

const {test, describe, before, beforeEach, after} = require('node:test')
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

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({username: 'root', name: 'Root User', passwordHash})
    await user.save()
})

after(async () => {
    await mongoose.connection.close()
})

describe('user creation', () => {

  test('succeeds with valid data', async () => {
    const newUser = {
      username: 'roger',
      name: 'Roger RP',
      password: 'password123'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/users')
    assert.strictEqual(response.body.length, 2) 

    const usernames = response.body.map(u => u.username)
    assert.ok(usernames.includes('roger'))
  })

  test('fails with 400 if username is already taken', async () => {
    const duplicateUser = {
      username: 'root',   
      name: 'Otro Root',
      password: '12345'
    }

    const response = await api
      .post('/api/users')
      .send(duplicateUser)
      .expect(400)

    
    assert.ok(response.body.error.includes('E11000 duplicate key error'))

    const usersAtEnd = await api.get('/api/users')
    assert.strictEqual(usersAtEnd.body.length, 1)
  })

  test('fails with 400 if password is missing', async () => {
    const userWithoutPassword = {
      username: 'nopass',
      name: 'No Pass'
    }

    const response = await api
      .post('/api/users')
      .send(userWithoutPassword)
      .expect(400)

    assert.ok(response.body.error.includes('password is required'))
  })

  test('fails with 400 if password is too short', async () => {
    const userWithShortPassword = {
      username: 'shortpass',
      name: 'Short Pass',
      password: 'ab'  
    }

    const response = await api
      .post('/api/users')
      .send(userWithShortPassword)
      .expect(400)

    assert.ok(response.body.error.includes('at least 3 characters'))
  })

  test('fails with 400 if username is missing', async () => {
  const userWithoutUsername = {
    name: 'No Username',
    password: 'password123'
  }

  const response = await api
    .post('/api/users')
    .send(userWithoutUsername)
    .expect(400)

  assert.ok(response.body.error.includes('username is required'))

  const usersAtEnd = await api.get('/api/users')
  assert.strictEqual(usersAtEnd.body.length, 1)
})

test('fails with 400 if username is too short', async () => {
  const userWithShortUsername = {
    username: 'ab',   // menos de 3 caracteres
    name: 'Short Username',
    password: 'password123'
  }

  const response = await api
    .post('/api/users')
    .send(userWithShortUsername)
    .expect(400)

  assert.ok(response.body.error.includes('username must be at least 3 characters'))

  const usersAtEnd = await api.get('/api/users')
  assert.strictEqual(usersAtEnd.body.length, 1)
})

})