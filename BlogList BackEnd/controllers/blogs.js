const router = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')

router.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
    response.json(blogs)
})

router.post('/', async (request, response) => {
    const user = request.user

    if (!user) {
        return response.status(401).json({error: 'token invalid'})
    }

    const blog = new Blog({...request.body, user: user._id})

    try{
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        response.status(201).json(savedBlog)
    } catch {
        response.status(400).json({error: error.message})
    }
})

router.delete('/:id', async (request, response) => {
    const user = request.user

    if(!user) {
        return response.status(401).json({error: 'token invalid'})
    }

    const blog = await Blog.findById(request.params.id)

    if(!blog) {
        return response.status(404).json({error: 'blog not found'})
    }

    if(blog.user.toString() !== user._id.toString()) {
        return response.status(403).json({error: 'only the creator can delete this blog'})
    }

    await blog.deleteOne()
    response.status(204).end()
})

router.put('/:id', async (request, response) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      request.body,
      { returnDocument: 'after' }
    ).populate('user', { username: 1, name: 1 })

    if (!updatedBlog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    response.json(updatedBlog)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

module.exports = router