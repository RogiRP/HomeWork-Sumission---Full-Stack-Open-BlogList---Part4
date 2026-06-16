const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')

    await request.post('http://localhost:3003/api/users', {
      data: {
        username: 'testuser',
        name: 'Test User',
        password: 'password123'
      }
    })

    await page.goto('http://localhost:5173')
    await page.evaluate(() => window.localStorage.clear())
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByRole('textbox', { name: 'username' }).fill('testuser')
      await page.getByRole('textbox', { name: 'password' }).fill('password123')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByRole('textbox', { name: 'username' }).fill('testuser')
      await page.getByRole('textbox', { name: 'password' }).fill('wrongpassword')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('wrong username or password')).toBeVisible()
      await expect(page.getByText('Test User logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
        await page.getByRole('textbox', { name: 'username' }).fill('testuser')
        await page.getByRole('textbox', { name: 'password' }).fill('password123')
        await page.getByRole('button', { name: 'login' }).click()
        await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
        await page.getByRole('button', { name: 'create new blog' }).click()

        await page.getByRole('textbox', { name: 'title' }).fill('E2E Test Blog')
        await page.getByRole('textbox', { name: 'author' }).fill('E2E Author')
        await page.getByRole('textbox', { name: 'url' }).fill('http://e2etest.com')

        await page.getByRole('button', { name: 'create' }).click()

        await expect(page.getByText('E2E Test Blog E2E Author')).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.getByRole('textbox', { name: 'title' }).fill('Blog to like')
            await page.getByRole('textbox', { name: 'author' }).fill('Test Author')
            await page.getByRole('textbox', { name: 'url' }).fill('http://test.com')
            await page.getByRole('button', { name: 'create' }).click()
            await expect(page.getByText('Blog to like Test Author')).toBeVisible()

            await page.getByRole('button', { name: 'view' }).click()
            await expect(page.getByText('likes 0')).toBeVisible()
            await page.getByRole('button', { name: 'like' }).click()
            await expect(page.getByText('likes 1')).toBeVisible()
        })
    
    test('the creator can delete a blog', async ({ page }) => {
        await page.getByRole('button', { name: 'create new blog' }).click()
        await page.getByRole('textbox', { name: 'title' }).fill('Blog to delete')
        await page.getByRole('textbox', { name: 'author' }).fill('Test Author')
        await page.getByRole('textbox', { name: 'url' }).fill('http://test.com')
        await page.getByRole('button', { name: 'create' }).click()
        await expect(page.getByText('Blog to delete Test Author')).toBeVisible()

        const blogElement = page.locator('.blog').filter({ hasText: 'Blog to delete' })

        await blogElement.getByRole('button', { name: 'view' }).click()
        await expect(blogElement.getByRole('button', { name: 'remove' })).toBeVisible()

        page.on('dialog', dialog => dialog.accept())
        await blogElement.getByRole('button', { name: 'remove' }).click()

        await expect(page.getByText('Blog to delete Test Author')).not.toBeVisible()
        })

    test('only the creator can see the delete button', async ({ page, request }) => {
        await request.post('http://localhost:3003/api/users', {
            data: {
            username: 'otheruser',
            name: 'Other User',
            password: 'password123'
            }
        })
        await page.getByRole('button', { name: 'create new blog' }).click()
        await page.getByRole('textbox', { name: 'title' }).fill('Blog by testuser')
        await page.getByRole('textbox', { name: 'author' }).fill('Test Author')
        await page.getByRole('textbox', { name: 'url' }).fill('http://test.com')
        await page.getByRole('button', { name: 'create' }).click()
        await expect(page.locator('.blog').filter({ hasText: 'Blog by testuser' })).toBeVisible()

        const blogElement = page.locator('.blog').filter({ hasText: 'Blog by testuser' })
        await blogElement.getByRole('button', { name: 'view' }).click()
        await expect(blogElement.getByRole('button', { name: 'remove' })).toBeVisible()

        await page.getByRole('button', { name: 'logout' }).click()

        await page.getByRole('textbox', { name: 'username' }).fill('otheruser')
        await page.getByRole('textbox', { name: 'password' }).fill('password123')
        await page.getByRole('button', { name: 'login' }).click()
        await expect(page.getByText('Other User logged in')).toBeVisible()

        const blogElementOther = page.locator('.blog').filter({ hasText: 'Blog by testuser' })
        await blogElementOther.getByRole('button', { name: 'view' }).click()
        await expect(blogElementOther.getByRole('button', { name: 'remove' })).not.toBeVisible()
        })

    test('blogs are ordered by likes, most likes first', async ({ page }) => {
        const blogs = [
            { title: 'Blog with 0 likes', author: 'Author A', url: 'http://a.com' },
            { title: 'Blog with 2 likes', author: 'Author B', url: 'http://b.com' },
            { title: 'Blog with 1 like', author: 'Author C', url: 'http://c.com' }
        ]

        for (const blog of blogs) {
            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.getByRole('textbox', { name: 'title' }).fill(blog.title)
            await page.getByRole('textbox', { name: 'author' }).fill(blog.author)
            await page.getByRole('textbox', { name: 'url' }).fill(blog.url)
            await page.getByRole('button', { name: 'create' }).click()
            await expect(page.locator('.blog').filter({ hasText: blog.title })).toBeVisible()
        }

        const secondBlog = page.locator('.blog').filter({ hasText: 'Blog with 2 likes' })
        await secondBlog.getByRole('button', { name: 'view' }).click()
        await secondBlog.getByRole('button', { name: 'like' }).click()
        await expect(secondBlog.getByText('likes 1')).toBeVisible()
        await secondBlog.getByRole('button', { name: 'like' }).click()
        await expect(secondBlog.getByText('likes 2')).toBeVisible()

        const thirdBlog = page.locator('.blog').filter({ hasText: 'Blog with 1 like' })
        await thirdBlog.getByRole('button', { name: 'view' }).click()
        await thirdBlog.getByRole('button', { name: 'like' }).click()
        await expect(thirdBlog.getByText('likes 1')).toBeVisible()

        const blogElements = await page.locator('.blog').all()
        const titles = await Promise.all(
            blogElements.map(el => el.locator('.blog-summary').textContent())
        )

        expect(titles[0]).toContain('Blog with 2 likes')
        expect(titles[1]).toContain('Blog with 1 like')
        expect(titles[2]).toContain('Blog with 0 likes')
        })
    })
})