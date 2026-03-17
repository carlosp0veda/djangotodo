import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  test('should allow a user to register and then login', async ({ page }) => {
    // 1. Start at the root (redirected to login by default if not authenticated)
    await page.goto('/');

    // 2. Switch to Registration
    await page.getByRole('button', { name: "Oops! I've never been here before" }).click();
    await expect(page.getByRole('heading', { name: 'Yay, New Friend!' })).toBeVisible();

    // 3. Register
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // 4. Verify redirected to TodoApp (look for "New Note" button)
    await expect(page.getByRole('button', { name: 'New Note' })).toBeVisible();

    // 5. Logout
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: "Yay, You're Back!" })).toBeVisible();

    // 6. Login with new credentials
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill(testPassword);
    await page.getByRole('button', { name: 'Login' }).click();

    // 7. Verify back in TodoApp
    await expect(page.getByRole('button', { name: 'New Note' })).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/');
    
    await page.locator('#email').fill('wrong@example.com');
    await page.locator('#password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify error message (LoginForm uses styles.errorBox)
    // We can look for text since it's likely a user-facing string
    await expect(page.locator('text=/Login failed/i')).toBeVisible();
  });
});
