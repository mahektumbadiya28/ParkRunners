# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking.spec.js >> Full Booking Journey >> should allow an owner to book a spot and track it
- Location: e2e/booking.spec.js:4:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/owner" until "load"
  navigated to "http://localhost:5173/"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - button "Toggle Theme" [ref=e3]
  - generic [ref=e7]:
    - banner [ref=e8]:
      - generic [ref=e9]:
        - link "VOLENPARK" [ref=e10] [cursor=pointer]:
          - /url: /
        - navigation [ref=e15]:
          - link "Features" [ref=e16] [cursor=pointer]:
            - /url: "#features"
          - link "Marketplace" [ref=e17] [cursor=pointer]:
            - /url: "#marketplace"
          - link "Valet Service" [ref=e18] [cursor=pointer]:
            - /url: "#valet"
        - generic [ref=e19]:
          - button "Toggle theme" [ref=e20]
          - generic [ref=e24]:
            - link "Sign In" [ref=e25] [cursor=pointer]:
              - /url: /login
            - link "Get Started" [ref=e26] [cursor=pointer]:
              - /url: /register
    - generic [ref=e30]:
      - generic [ref=e31]: Next-Gen Smart Parking Marketplace · Live Now
      - heading "Park Smarter. Earn More. Stress Less." [level=1] [ref=e34]: Park Smarter.Earn More.Stress Less.
      - paragraph [ref=e35]: The peer-to-peer parking ecosystem connecting car owners, space hosts, and professional valet drivers. Find spots, share spaces, and summon valets on demand.
      - generic [ref=e36]:
        - link "Start for Free" [ref=e37] [cursor=pointer]:
          - /url: /register
        - link "Sign In" [ref=e42] [cursor=pointer]:
          - /url: /login
      - generic [ref=e43]: 48,000+ drivers trust VolenPark★★★★★
    - generic [ref=e69]:
      - generic [ref=e70]:
        - paragraph [ref=e74]: 12,400+
        - paragraph [ref=e75]: Active Spots
      - generic [ref=e76]:
        - paragraph [ref=e82]: 48,000+
        - paragraph [ref=e83]: Happy Drivers
      - generic [ref=e84]:
        - paragraph [ref=e88]: "28"
        - paragraph [ref=e89]: Cities Covered
      - generic [ref=e90]:
        - paragraph [ref=e94]: 62%
        - paragraph [ref=e95]: Avg. Savings
    - generic [ref=e97]:
      - generic [ref=e98]:
        - generic [ref=e99]: How It Works
        - heading "Choose Your Role" [level=2] [ref=e100]
        - paragraph [ref=e101]: VolenPark connects three distinct user roles to build a seamless smart parking ecosystem.
      - generic [ref=e102]:
        - generic [ref=e103]:
          - generic [ref=e109]: Find & Book
          - heading "Car Owners" [level=3] [ref=e110]
          - paragraph [ref=e111]: Search real-time parking spaces. Use maps, choose valets, and summon your car on-demand with live GPS tracking.
          - list [ref=e112]:
            - listitem [ref=e113]: Live interactive map
            - listitem [ref=e117]: Valet on-demand
            - listitem [ref=e121]: Instant QR pass
          - link "Get Started as Owner" [ref=e125] [cursor=pointer]:
            - /url: /register?role=owner
        - generic [ref=e128]:
          - generic [ref=e133]: Earn Passive
          - heading "Space Hosts" [level=3] [ref=e134]
          - paragraph [ref=e135]: List your driveway, garage, or lot. Set hourly pricing, define availability, and withdraw earnings weekly.
          - list [ref=e136]:
            - listitem [ref=e137]: Easy listing flow
            - listitem [ref=e141]: Automated scheduling
            - listitem [ref=e145]: Weekly payouts
          - link "Become a Host" [ref=e149] [cursor=pointer]:
            - /url: /register?role=provider
        - generic [ref=e152]:
          - generic [ref=e158]: Earn & Drive
          - heading "Valet Drivers" [level=3] [ref=e159]
          - paragraph [ref=e160]: Accept bookings, run digital 4-side inspections, scan QR check-ins, park safely, and earn money per job.
          - list [ref=e161]:
            - listitem [ref=e162]: Flexible hours
            - listitem [ref=e166]: Digital inspections
            - listitem [ref=e170]: Per-job earnings
          - link "Join as Valet" [ref=e174] [cursor=pointer]:
            - /url: /register?role=valet
    - generic [ref=e178]:
      - generic [ref=e179]:
        - generic [ref=e180]: Everything You Need
        - heading "Platform Features" [level=2] [ref=e181]
        - paragraph [ref=e182]: Every tool you need to park, host, and earn — built into one seamless experience.
      - generic [ref=e183]:
        - generic [ref=e184]:
          - heading "Real-Time Spot Map" [level=3] [ref=e189]
          - paragraph [ref=e190]: Browse thousands of verified spots on an interactive live map with instant availability updates.
        - generic [ref=e191]:
          - heading "Vetted Valet Drivers" [level=3] [ref=e195]
          - paragraph [ref=e196]: Every driver goes through background checks, skill testing, and digital ID verification.
        - generic [ref=e197]:
          - heading "Instant Booking" [level=3] [ref=e201]
          - paragraph [ref=e202]: Book in under 30 seconds. Get confirmation, QR pass, and valet ETA all in one tap.
        - generic [ref=e203]:
          - heading "Earn with Your Space" [level=3] [ref=e208]
          - paragraph [ref=e209]: Turn your empty driveway or garage into a passive income stream. Set your own price.
        - generic [ref=e210]:
          - heading "Flexible Duration" [level=3] [ref=e215]
          - paragraph [ref=e216]: Hourly, daily, or monthly plans. Change or cancel bookings up to 30 minutes before arrival.
        - generic [ref=e217]:
          - heading "Trusted Community" [level=3] [ref=e221]
          - paragraph [ref=e222]: Ratings, reviews, and a dispute resolution team ensure quality for every single booking.
    - generic [ref=e224]:
      - generic [ref=e225]:
        - generic [ref=e226]: Social Proof
        - heading "Loved by Thousands" [level=2] [ref=e227]
      - generic [ref=e228]:
        - generic [ref=e229]:
          - blockquote [ref=e241]: "\"Found a spot right next to my office in under a minute. The valet was professional and the app is so slick!\""
          - generic [ref=e242]:
            - generic [ref=e243]: P
            - generic [ref=e244]:
              - paragraph [ref=e245]: Priya Sharma
              - paragraph [ref=e246]: Software Engineer
        - generic [ref=e247]:
          - blockquote [ref=e259]: "\"I list my garage on weekdays and now earn ₹18,000 a month with zero effort. Easiest passive income ever.\""
          - generic [ref=e260]:
            - generic [ref=e261]: A
            - generic [ref=e262]:
              - paragraph [ref=e263]: Arjun Mehta
              - paragraph [ref=e264]: Space Host
        - generic [ref=e265]:
          - blockquote [ref=e277]: "\"Used VolenPark for a corporate event. Booked 40 spots for guests in 10 minutes. Absolutely flawless.\""
          - generic [ref=e278]:
            - generic [ref=e279]: K
            - generic [ref=e280]:
              - paragraph [ref=e281]: Kavita Patel
              - paragraph [ref=e282]: Event Manager
    - generic [ref=e286]:
      - heading "Ready to park smarter?" [level=2] [ref=e287]
      - paragraph [ref=e288]: Join 48,000+ drivers already using VolenPark every day.
      - link "Create Free Account" [ref=e289] [cursor=pointer]:
        - /url: /register
    - contentinfo [ref=e292]:
      - generic [ref=e293]:
        - generic [ref=e294]:
          - generic [ref=e295]:
            - link "VOLENPARK" [ref=e296] [cursor=pointer]:
              - /url: /
            - paragraph [ref=e301]: The smart, peer-to-peer parking ecosystem connecting car owners, space hosts, and professional valet drivers.
            - generic [ref=e302]:
              - link [ref=e303] [cursor=pointer]:
                - /url: "#"
              - link [ref=e308] [cursor=pointer]:
                - /url: "#"
              - link [ref=e312] [cursor=pointer]:
                - /url: "#"
          - generic [ref=e316]:
            - heading "Product" [level=4] [ref=e317]
            - list [ref=e318]:
              - listitem [ref=e319]:
                - link "Features" [ref=e320] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e321]:
                - link "Marketplace" [ref=e322] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e323]:
                - link "Valet Service" [ref=e324] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e325]:
                - link "Pricing" [ref=e326] [cursor=pointer]:
                  - /url: "#"
          - generic [ref=e327]:
            - heading "Company" [level=4] [ref=e328]
            - list [ref=e329]:
              - listitem [ref=e330]:
                - link "About" [ref=e331] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e332]:
                - link "Blog" [ref=e333] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e334]:
                - link "Careers" [ref=e335] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e336]:
                - link "Press" [ref=e337] [cursor=pointer]:
                  - /url: "#"
          - generic [ref=e338]:
            - heading "Legal" [level=4] [ref=e339]
            - list [ref=e340]:
              - listitem [ref=e341]:
                - link "Privacy Policy" [ref=e342] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e343]:
                - link "Terms of Service" [ref=e344] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e345]:
                - link "Cookie Policy" [ref=e346] [cursor=pointer]:
                  - /url: "#"
        - generic [ref=e347]:
          - paragraph [ref=e348]: © 2026 VolenPark Platforms Inc. All rights reserved.
          - paragraph [ref=e349]: Made with by the VolenPark team
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Full Booking Journey', () => {
  4  |   test('should allow an owner to book a spot and track it', async ({ page }) => {
  5  |     // 1. Visit Login
  6  |     await page.goto('http://localhost:5173/login');
  7  | 
  8  |     // 2. Mock or perform login (assuming dummy login credentials for E2E)
  9  |     // Wait for email input
  10 |     await page.fill('input[type="email"]', 'owner@example.com');
  11 |     await page.fill('input[type="password"]', 'password123');
  12 |     await page.click('button[type="submit"]');
  13 | 
  14 |     // Wait for navigation to dashboard
> 15 |     await page.waitForURL('**/owner');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  16 |     
  17 |     // Expect dashboard title to be visible
  18 |     await expect(page.locator('text=Find Parking').first()).toBeVisible({ timeout: 10000 });
  19 | 
  20 |     // 3. Navigate to Booking flow (assuming there is a Book button or we go directly to a spot)
  21 |     // We will navigate to the Map and click on a spot
  22 |     await page.click('text=Find Parking');
  23 |     await page.waitForURL('**/map');
  24 | 
  25 |     // Wait for map markers/popup to load (mocking that there's a book button)
  26 |     // Here we will just wait for network idle to ensure spots are loaded
  27 |     await page.waitForLoadState('networkidle');
  28 | 
  29 |     // Since clicking on Leaflet markers via Playwright is tricky without specific IDs, 
  30 |     // we can directly navigate to a mock booking flow for a spot
  31 |     // In a real scenario we would mock the `/api/spots` response.
  32 |     // Let's assume spot ID is 'mockSpot123'
  33 |     await page.goto('http://localhost:5173/book/mockSpot123');
  34 | 
  35 |     // 4. Fill booking form (Step 1)
  36 |     await expect(page.locator('text=Arrival & Duration')).toBeVisible();
  37 |     await page.click('button:has-text("Continue")');
  38 | 
  39 |     // 5. Select Vehicle (Step 2)
  40 |     await expect(page.locator('text=Select Vehicle & Services')).toBeVisible();
  41 |     // Assuming there is at least one vehicle card
  42 |     await page.locator('.border-2.cursor-pointer').first().click();
  43 |     await page.click('button:has-text("Continue")');
  44 | 
  45 |     // 6. Confirm Booking (Step 3)
  46 |     await expect(page.locator('text=Confirm Booking')).toBeVisible();
  47 |     await page.click('button:has-text("Confirm & Pay Later")');
  48 | 
  49 |     // 7. Verify Optimistic UI / Redirect
  50 |     // Should navigate to owner dashboard or tracking
  51 |     await page.waitForURL('**/owner');
  52 |     
  53 |     // Toast should be visible
  54 |     await expect(page.locator('text=Booking confirmed successfully!')).toBeVisible();
  55 |   });
  56 | });
  57 | 
```