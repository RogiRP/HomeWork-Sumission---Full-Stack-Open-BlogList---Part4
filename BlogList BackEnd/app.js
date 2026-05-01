const express = require('express')
const app = express()
const cors = require('cors')
const Blog = require('./models/blog')

app.use(cors())
app.use(express.json())

app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

app.post('/api/blogs', async (request, response) => {
  const blog = new Blog(request.body)
  try{
    const savedBlog = await blog.save()
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

module.exports = app