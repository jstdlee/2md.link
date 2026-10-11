const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Collect console messages
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type()}]:`, msg.text());
  });

  // Collect page errors
  page.on('pageerror', err => {
    console.log('[PAGE ERROR]:', err.message);
  });

  console.log('=== Opening 2md.link page ===');
  await page.goto('http://172.17.0.1:3001/', { waitUntil: 'networkidle', timeout: 30000 });

  await page.waitForTimeout(2000);

  // Take initial screenshot
  await page.screenshot({ path: '/workspace/debug-screenshot-1.png' });
  console.log('Screenshot 1 saved');

  // Test 1: Click on a tab (python)
  console.log('\n=== TEST 1: Click Python tab ===');
  const pythonTab = await page.$('button[data-tab="python"]');
  if (pythonTab) {
    await pythonTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/workspace/debug-screenshot-2.png' });
    console.log('Clicked python tab');

    const pythonContent = await page.$('#tab-python.active');
    console.log('Python tab active:', !!pythonContent);
  }

  // Test 2: Click convert button
  console.log('\n=== TEST 2: Click Convert button ===');
  const urlInput = await page.$('#urlInput');
  const convertBtn = await page.$('#convertBtn');

  if (urlInput && convertBtn) {
    await urlInput.fill('example.com');
    console.log('Filled URL');

    await convertBtn.click();
    console.log('Clicked convert');

    await page.waitForTimeout(5000);

    await page.screenshot({ path: '/workspace/debug-screenshot-3.png' });

    const resultVisible = await page.$('#result');
    const resultStyle = await page.$eval('#result', el => el.style.display);
    console.log('Result display style:', resultStyle);

    const markdownValue = await page.$eval('#markdownOutput', el => el.value);
    console.log('Markdown length:', markdownValue.length);
  }

  await browser.close();
  console.log('\nDone!');
})();
