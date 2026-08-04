import { test, expect } from '@playwright/test';

test.describe('Full Booking Journey', () => {
  test('should allow an owner to book a spot and track it', async ({ page }) => {
    // 1. Visit Login
    await page.goto('http://localhost:5173/login');

    // 2. Mock or perform login (assuming dummy login credentials for E2E)
    // Wait for email input
    await page.fill('input[type="email"]', 'owner@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/owner');
    
    // Expect dashboard title to be visible
    await expect(page.locator('text=Find Parking').first()).toBeVisible({ timeout: 10000 });

    // 3. Navigate to Booking flow (assuming there is a Book button or we go directly to a spot)
    // We will navigate to the Map and click on a spot
    await page.click('text=Find Parking');
    await page.waitForURL('**/map');

    // Wait for map markers/popup to load (mocking that there's a book button)
    // Here we will just wait for network idle to ensure spots are loaded
    await page.waitForLoadState('networkidle');

    // Since clicking on Leaflet markers via Playwright is tricky without specific IDs, 
    // we can directly navigate to a mock booking flow for a spot
    // In a real scenario we would mock the `/api/spots` response.
    // Let's assume spot ID is 'mockSpot123'
    await page.goto('http://localhost:5173/book/mockSpot123');

    // 4. Fill booking form (Step 1)
    await expect(page.locator('text=Arrival & Duration')).toBeVisible();
    await page.click('button:has-text("Continue")');

    // 5. Select Vehicle (Step 2)
    await expect(page.locator('text=Select Vehicle & Services')).toBeVisible();
    // Assuming there is at least one vehicle card
    await page.locator('.border-2.cursor-pointer').first().click();
    await page.click('button:has-text("Continue")');

    // 6. Confirm Booking (Step 3)
    await expect(page.locator('text=Confirm Booking')).toBeVisible();
    await page.click('button:has-text("Confirm & Pay Later")');

    // 7. Verify Optimistic UI / Redirect
    // Should navigate to owner dashboard or tracking
    await page.waitForURL('**/owner');
    
    // Toast should be visible
    await expect(page.locator('text=Booking confirmed successfully!')).toBeVisible();
  });
});
