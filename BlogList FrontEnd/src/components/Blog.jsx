import { useState } from 'react'

const Blog = ({ blog, onLike, onDelete, currentUser }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const isCreator = currentUser && blog.user &&
    currentUser.username === blog.user.username

  return (
    <div style={blogStyle} className="blog">
      <div className="blog-summary">
        {blog.title} {blog.author}
        <button onClick={() => setVisible(!visible)}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>
      {visible && (
        <div className="blog-details">
          <p>{blog.url}</p>
          <p>
            likes {blog.likes}
            <button onClick={() => onLike(blog)}>like</button>
          </p>
          <p>{blog.user?.name}</p>
          {isCreator && (
            <button onClick={() => onDelete(blog)}>remove</button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog