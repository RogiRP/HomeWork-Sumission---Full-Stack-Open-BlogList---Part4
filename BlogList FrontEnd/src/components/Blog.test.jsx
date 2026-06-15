import { render, screen } from '@testing-library/react'
import Blog from './Blog'

const blog = {
  title: 'Test Blog Title',
  author: 'Test Author',
  url: 'http://testurl.com',
  likes: 5,
  user: {
    username: 'testuser',
    name: 'Test User'
  }
}

test('renders title and author but not url or likes by default', () => {
  render(<Blog blog={blog} />)

  expect(screen.getByText('Test Blog Title Test Author', { exact: false })).toBeVisible()
  expect(screen.queryByText('http://testurl.com')).not.toBeInTheDocument()
  expect(screen.queryByText('likes 5', { exact: false })).not.toBeInTheDocument()
})