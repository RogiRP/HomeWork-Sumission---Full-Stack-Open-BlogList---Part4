const express = require('express')
const app = express()
const cors = require('cors')
const Blog = require('./models/blog')
const usersRouter = require('./controllers/users')
const User = require('./models/user')
const loginRouter = require('./controllers/login')
const jwt = require('jsonwebtoken')

app.use(cors())
app.use(express.json())

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ', '')
  }
  return null
}

app.use('/api/login', loginRouter)
app.use('/api/login', usersRouter)

app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(blogs)
})

app.post('/api/blogs', async (request, response) => {
  const token = getTokenFrom(request)

  let decodedToken
  try{
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch {
    return response.status(401).json({ error: 'token invalid' })
  }
  
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  
  const user = await User.findById(decodedToken.id)
  
  const blog = new Blog({...request.body, user: user._id})
  try{
    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    response.status(400).json({error: error.message})
  }
  
})

app.delete('/api/blogs/:id', async(request, response) => {
  const result = await Blog.findByIdAndDelete(request.params.id)

  if (!result) { 
    return response.status(404).json({error: 'blog not found'})
  }

  response.status(204).end()

})

app.put('/api/blogs/:id', async (request, response) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      request.body,
      {returnDocument: 'after'}
    )

    if (!updatedBlog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    response.json(updatedBlog)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})


module.exports = app