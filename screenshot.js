const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Assume the server is running on localhost:3000
  await page.goto('http://localhost:3000/auth/login');

  // Log in as admin
  await page.type('input[name="username"]', 'admin');
  await page.type('input[name="password"]', 'admin123'); // Adjust password if needed
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation()
  ]);

  // Go to maintenance
  await page.goto('http://localhost:3000/maintenance');

  // Verify there is a row
  const buttons = await page.$$('button[onclick^="openView("]');
  if (buttons.length > 0) {
      await buttons[0].click();
      
      // Wait for modal to be visible
      await page.waitForSelector('#viewModal', { visible: true });
      
      // Take screenshot
      await page.screenshot({ path: 'modal_screenshot.png' });
      console.log('Screenshot saved to modal_screenshot.png');
  } else {
      console.log('No VIEW buttons found.');
  }

  await browser.close();
})();
