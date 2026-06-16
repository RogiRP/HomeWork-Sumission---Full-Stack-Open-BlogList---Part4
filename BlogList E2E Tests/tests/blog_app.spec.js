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
})
})