// Comprehensive API tests for 2md.link

const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  const baseUrl = 'localhost:3001';
  let passed = 0;
  let failed = 0;

  const tests = [
    // GET API tests
    {
      name: 'GET /api/convert/example.com',
      run: async () => {
        const res = await makeRequest({ hostname: 'localhost', port: 3001, path: '/api/convert/example.com', method: 'GET' });
        return res.status === 200 && res.body.title === 'Example Domain';
      }
    },
    {
      name: 'GET /api/convert/https://example.com',
      run: async () => {
        const res = await makeRequest({ hostname: 'localhost', port: 3001, path: '/api/convert/https://example.com', method: 'GET' });
        return res.status === 200 && res.body.title === 'Example Domain';
      }
    },
    {
      name: 'GET /https://example.com (direct)',
      run: async () => {
        const res = await makeRequest({ hostname: 'localhost', port: 3001, path: '/https://example.com', method: 'GET' });
        return res.status === 200 && res.body.title === 'Example Domain';
      }
    },
    {
      name: 'GET /http://example.com (direct)',
      run: async () => {
        const res = await makeRequest({ hostname: 'localhost', port: 3001, path: '/http://example.com', method: 'GET' });
        return res.status === 200 && res.body.title === 'Example Domain';
      }
    },
    {
      name: 'GET /example.com (plain domain)',
      run: async () => {
        const res = await makeRequest({ hostname: 'localhost', port: 3001, path: '/example.com', method: 'GET' });
        return res.status === 200 && res.body.title === 'Example Domain';
      }
    },
    // POST API tests
    {
      name: 'POST /api/convert with URL',
      run: async () => {
        const postData = JSON.stringify({ url: 'https://example.com' });
        const res = await makeRequest({
          hostname: 'localhost',
          port: 3001,
          path: '/api/convert',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
        }, postData);
        return res.status === 200 && res.body.title === 'Example Domain';
      }
    },
    {
      name: 'POST /api/convert with domain only',
      run: async () => {
        const postData = JSON.stringify({ url: 'example.com' });
        const res = await makeRequest({
          hostname: 'localhost',
          port: 3001,
          path: '/api/convert',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
        }, postData);
        return res.status === 200 && res.body.title === 'Example Domain';
      }
    },
    {
      name: 'POST /api/convert with malformed URL (htp://)',
      run: async () => {
        const postData = JSON.stringify({ url: 'htp://example.com' });
        const res = await makeRequest({
          hostname: 'localhost',
          port: 3001,
          path: '/api/convert',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
        }, postData);
        return res.status === 200 && res.body.title === 'Example Domain';
      }
    },
    {
      name: 'POST /api/convert with missing URL (error)',
      run: async () => {
        const postData = JSON.stringify({});
        const res = await makeRequest({
          hostname: 'localhost',
          port: 3001,
          path: '/api/convert',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
        }, postData);
        return res.status === 400 && res.body.error;
      }
    },
    {
      name: 'GET /api/convert/invalid-url (error)',
      run: async () => {
        const res = await makeRequest({ hostname: 'localhost', port: 3001, path: '/api/convert/!@#$%', method: 'GET' });
        return res.status === 400;
      }
    },
  ];

  console.log('=== 2md.link API Test Suite ===\n');

  for (const test of tests) {
    try {
      const result = await test.run();
      if (result) {
        console.log(`[PASS] ${test.name}`);
        passed++;
      } else {
        console.log(`[FAIL] ${test.name}`);
        failed++;
      }
    } catch (e) {
      console.log(`[FAIL] ${test.name} - Error: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => {
  console.error('Test error:', e.message);
  process.exit(1);
});
