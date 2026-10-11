const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    console.log(`[CONSOLE ${msg.type()}]:`, text);
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
    console.log('[PAGE ERROR]:', err.message);
  });

  console.log('=== Opening 2md.link page ===');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for DOM to be ready
  await page.waitForTimeout(2000);

  // Take initial screenshot
  await page.screenshot({ path: '/home/fxyz/.openclaw/workspace/2md.link/debug-screenshot-1.png' });
  console.log('Screenshot 1 saved (initial page)');

  // Test 1: Click on a tab (python)
  console.log('\n=== TEST 1: Click Python tab ===');
  const pythonTab = await page.$('button[data-tab="python"]');
  if (pythonTab) {
    await pythonTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/home/fxyz/.openclaw/workspace/2md.link/debug-screenshot-2.png' });
    console.log('Clicked python tab, screenshot saved');

    // Check if python tab content is visible
    const pythonContent = await page.$('#tab-python.active');
    console.log('Python tab active:', !!pythonContent);
  } else {
    console.log('Python tab button not found!');
  }

  // Test 2: Click convert button
  console.log('\n=== TEST 2: Click Convert button ===');
  const convertBtn = await page.$('#convertBtn');
  const urlInput = await page.$('#urlInput');

  if (urlInput && convertBtn) {
    await urlInput.fill('example.com');
    console.log('Filled URL: example.com');

    await convertBtn.click();
    console.log('Clicked convert button');

    // Wait for response
    await page.waitForTimeout(5000);

    await page.screenshot({ path: '/home/fxyz/.openclaw/workspace/2md.link/debug-screenshot-3.png' });
    console.log('Screenshot 3 saved (after convert)');

    // Check result
    const resultVisible = await page.$('#result[style*="flex"]');
    console.log('Result visible:', !!resultVisible);

    // Check for markdown output
    const markdownValue = await page.$eval('#markdownOutput', el => el.value);
    console.log('Markdown output length:', markdownValue.length);
    if (markdownValue.length > 0) {
      console.log('Markdown preview:', markdownValue.substring(0, 100));
    }
  } else {
    console.log('URL input or convert button not found!');
  }

  // Test 3: Test Enter key on input
  console.log('\n=== TEST 3: Test Enter key ===');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  const urlInput2 = await page.$('#urlInput');
  if (urlInput2) {
    await urlInput2.fill('example.org');
    await urlInput2.press('Enter');
    console.log('Pressed Enter on URL input');

    await page.waitForTimeout(5000);

    await page.screenshot({ path: '/home/fxyz/.openclaw/workspace/2md.link/debug-screenshot-4.png' });
    console.log('Screenshot 4 saved (after Enter key)');
  }

  console.log('\n=== SUMMARY ===');
  console.log('Console messages:', consoleMessages.length);
  console.log('Page errors:', pageErrors.length);

  if (pageErrors.length > 0) {
    console.log('\n=== PAGE ERRORS ===');
    pageErrors.forEach(e => console.log(e));
  }

  await browser.close();
  console.log('\nDone!');
})();
