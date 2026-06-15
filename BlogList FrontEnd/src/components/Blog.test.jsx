import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

test('shows url and likes when view button is clicked', async () => {
  render(<Blog blog={blog} />)

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  expect(screen.getByText('http://testurl.com')).toBeVisible()
  expect(screen.getByText('likes 5', { exact: false })).toBeVisible()
})

test('calls like handler twice when like button is clicked twice', async () => {
  const mockLike = vi.fn()

  render(<Blog blog={blog} onLike={mockLike} />)

  const user = userEvent.setup()

  await user.click(screen.getByText('view'))

  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockLike).toHaveBeenCalledTimes(2)
})