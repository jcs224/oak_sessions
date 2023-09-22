import { test, expect } from '@playwright/test';
import { runtimeCommand } from '../test_setup';

test('logs in a user after several mistakes', async ({ page }) => {
  await page.goto('http://localhost:8002' + '/');

  // Expect a title "to contain" a substring.

  await page.locator('#email').fill('test@test.com')
  await page.locator('#password').fill('incorrect')
  await page.locator('#login-button').click()

  await expect(page.locator('#error')).toContainText('Incorrect username or password')
  await expect(page.locator('#failed-login-attempts')).toContainText('Failed login attempts: 1')

  await page.goto('http://localhost:8002' + '/')
  await expect(page.locator('#failed-login-attempts')).toContainText('Failed login attempts: 1')
  await expect(page.locator('#error')).toBeHidden()
  await page.locator('#email').fill('test@test.com')
  await page.locator('#password').fill('wrong')
  await page.locator('#login-button').click()

  await expect(page.locator('#failed-login-attempts')).toContainText('Failed login attempts: 2')
  
  await page.locator('#email').fill('test@test.com')
  await page.locator('#password').fill('correct')
  await page.locator('#login-button').click()
  await expect(page.locator('#message')).toContainText('Login successful')

  await page.goto('http://localhost:8002' + '/')
  await expect(page.locator('#logout-button')).toContainText('Log out test@test.com')
  await expect(page.locator('#message')).toBeHidden()
  await page.locator('#logout-button').click()

  await page.goto('http://localhost:8002' + '/')
  await page.locator('#email').fill('test@test.com')
  await page.locator('#password').fill('incorrect')
  await page.locator('#login-button').click()
  await expect(page.locator('#error')).toContainText('Incorrect username or password')
  await expect(page.locator('#failed-login-attempts')).toContainText('Failed login attempts: 1')
});
