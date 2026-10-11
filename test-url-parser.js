// Test cases for URL parsing with malformed inputs

const testCases = [
  // Normal URLs - should work
  { input: 'https://example.com', desc: 'Normal https URL' },
  { input: 'http://example.com', desc: 'Normal http URL' },
  { input: 'example.com', desc: 'Domain only' },

  // Misspelled protocols - should be corrected
  { input: 'htp://example.com', desc: 'Missing p in http' },
  { input: 'htps://example.com', desc: 'Missing p in https' },
  { input: 'http:/example.com', desc: 'Single slash in http' },
  { input: 'https:/example.com', desc: 'Single slash in https' },
  { input: 'httpp://example.com', desc: 'Extra p in http' },
  { input: 'httpss://example.com', desc: 'Extra s in https' },
  { input: 'httpp:/example.com', desc: 'httpp with single slash' },
  { input: 'httppps://example.com', desc: 'Multiple typos' },
  { input: 'htt://example.com', desc: 'Missing tp' },
  { input: 'ttp://example.com', desc: 'Missing h' },
  { input: 'tp://example.com', desc: 'Only tp' },
  { input: 'httppps:/example.com', desc: 'httppps with single slash' },
  { input: 'https:/example.com/path', desc: 'https with single slash and path' },

  // More protocol typos
  { input: 'http::/example.com', desc: 'Double colon in http' },
  { input: 'https::/example.com', desc: 'Double colon in https' },
  { input: 'http:///example.com', desc: 'Triple slash http' },
  { input: 'https:///example.com', desc: 'Triple slash https' },
  { input: 'https:///', desc: 'Only https with triple slash (no domain)' },
  { input: 'data:text/html,<h1>test</h1>', desc: 'Data URL (not supported)' },

  // Copy/paste with trailing slashes or incomplete
  { input: 'https://2md-link.jstdlee.workers.dev/github.com', desc: 'Full URL with path' },
  { input: 'htp:/example.com', desc: 'htp with single slash' },
  { input: 'htp:/example.com/path', desc: 'htp with path' },

  // Edge cases
  { input: '  https://example.com  ', desc: 'URL with whitespace' },
  { input: 'example.com/path', desc: 'Domain with path' },
  { input: 'http://example.com:8080', desc: 'URL with port' },
  { input: 'example.com:8080', desc: 'Domain with port' },
  { input: 'https://example.com/', desc: 'URL with trailing slash' },
  { input: 'https://example.com//', desc: 'URL with double trailing slash' },
  { input: 'https://example.com///', desc: 'URL with triple trailing slash' },

  // Mixed case
  { input: 'HTTPS://EXAMPLE.COM', desc: 'Uppercase HTTPS' },
  { input: 'HTTP://EXAMPLE.COM', desc: 'Uppercase HTTP' },
  { input: 'Https://Example.com', desc: 'Mixed case' },
  { input: 'Example.com', desc: 'Domain only lowercase' },

  // More malformed protocols
  { input: 'httt://example.com', desc: 'Extra t in http' },
  { input: 'httpt://example.com', desc: 'Extra t at end' },
  { input: 'httpss:/example.com', desc: 'httpss with single slash' },
  { input: 'httppp://example.com', desc: 'Multiple extra p' },
  { input: 'httpt://example.com', desc: 'httppt typo' },
  { input: 'htttps://example.com', desc: 'Added t after h' },

  // Protocol variations
  { input: 'httpwww://example.com', desc: 'httpwww typo' },
  { input: 'httpswww://example.com', desc: 'httpswww typo' },
  { input: 'www.example.com', desc: 'WWW prefix' },
  { input: 'httpwww.example.com', desc: 'httpwww with domain' },

  // Common paste mistakes
  { input: '//example.com', desc: 'Double slash only' },
  { input: '///example.com', desc: 'Triple slash only' },
  { input: '////example.com', desc: 'Quad slash only' },
  { input: ':example.com', desc: 'Colon only' },
  { input: ':/example.com', desc: 'Colon slash only' },

  // Chinese domain names (IDN)
  { input: '中文.com', desc: 'Chinese domain .com' },
  { input: '中文.cn', desc: 'Chinese domain .cn' },
  { input: '中文.中国', desc: 'Chinese domain Chinese TLD' },
  { input: '测试.com', desc: 'Test in Chinese .com' },
  { input: '例え.jp', desc: 'Japanese example .jp' },
  { input: 'مثال.eg', desc: 'Arabic example .eg' },
  { input: 'https://中文.com', desc: 'Chinese domain with https' },
  { input: 'http://中文.cn/path', desc: 'Chinese domain with path' },

  // Unicode/emoji domains (may not resolve but should parse)
  { input: '⭐.com', desc: 'Star emoji domain' },

  // Numbers and special chars in domain
  { input: 'example123.com', desc: 'Domain with numbers' },
  { input: '123example.com', desc: 'Domain starting with numbers' },
  { input: 'sub.domain.example.com', desc: 'Multiple subdomains' },
  { input: 'example.co.uk', desc: 'Two-part TLD' },
  { input: 'a.b.c.d.example.com', desc: 'Many subdomains' },

  // Very malformed
  { input: 'blah://example.com', desc: 'Random protocol' },
  { input: 'ftp://example.com', desc: 'FTP protocol' },
  { input: 'file://example.com', desc: 'File protocol' },
  { input: 'javascript://example.com', desc: 'JS protocol' },
  { input: 'data:text/html,<h1>test</h1>', desc: 'Data URL' },
];

// Test the fixUrlPrefix function
function fixUrlPrefix(s) {
  if (!s || typeof s !== 'string') return s;

  // Remove dangerous characters (but preserve unicode for IDN)
  s = s.replace(/[<>"'()]/g, '');

  // Remove any protocol-like prefix
  // This pattern handles: http://, https://, htp://, htt://, httpp://, httpps://, ttp://, tp://, etc.

  // More aggressive pattern - match anything that looks like http/https prefix with typos
  const patterns = [
    /^(?:h[a-z]*)?t(?:p(?:s)?[a-z]*){1,2}:+\/?\/?/i, // optional h + 1-2x (tp/tps) + letters + :// etc (handle double colon)
    /^(?:h[a-z]*)?tp[a-z]*:+\/?\/?/i,                 // optional h + tp + letters + :// etc
    /^t[pza-z]+:+\/?\/?/i,                            // starts with t + letters (like ttp, tps, etc) + ://
    /^h[a-z]+:+\/?\/?/i,                              // just h + letters + :// (catch-all for malformed)
  ];

  for (const pattern of patterns) {
    while (pattern.test(s)) {
      s = s.replace(pattern, '');
    }
  }

  // Also handle if user typed just "://" or ":://" etc
  s = s.replace(/^:+\/+/, '');

  // Also handle stray slashes at the beginning
  s = s.replace(/^\/+/, '');

  // Also handle just colon at beginning
  s = s.replace(/^:+/, '');

  // Check if there's anything left that looks like a domain
  // If empty or just special chars, return null later

  // Ensure we have proper protocol
  s = 'https://' + s;

  // Clean up any double/triple slashes
  s = s.replace(/^https:\/+/i, 'https://');

  return s;
}

// Helper: Convert IDN (internationalized) domain to punycode
function toPunycode(hostname) {
  try {
    // Use the 'url' module's domainToASCII
    const { domainToASCII } = require('url');
    return domainToASCII(hostname);
  } catch (e) {
    return hostname;
  }
}

// Test parseUrlInput
function parseUrlInput(input) {
  if (!input || typeof input !== 'string') return null;

  let s = input.trim();
  if (!s) return null;

  // First try to fix the URL prefix
  s = fixUrlPrefix(s);

  // Handle IDN (internationalized domain names) - convert Unicode to punycode
  if (!s.match(/^https?:\/\//i)) {
    // For domains without protocol, try to convert IDN to punycode
    const domainMatch = s.match(/^([a-zA-Z0-9][-a-zA-Z0-9.]*)/);
    if (domainMatch) {
      const domain = domainMatch[1];
      const punycodeDomain = toPunycode(domain);
      if (punycodeDomain !== domain) {
        s = s.replace(domain, punycodeDomain);
      }
    }
  }

  // Now try to parse as URL
  if (s.indexOf('://') > 0) {
    try { return new URL(s); } catch (e) { return null; }
  }

  // Try with https:// prefix
  try { return new URL('https://' + s); } catch (e) {}

  // Try with http:// prefix
  try { return new URL('http://' + s); } catch (e) {}

  return null;
}

// Run tests
console.log('=== URL Parsing Test Results ===\n');
let passed = 0;
let failed = 0;

testCases.forEach(tc => {
  const result = parseUrlInput(tc.input);
  const status = result ? 'PASS' : 'FAIL';
  const href = result ? result.href : 'null';

  console.log(`[${status}] ${tc.desc}`);
  console.log(`  Input:  "${tc.input}"`);
  console.log(`  Output: "${href}"`);

  if (status === 'PASS') passed++;
  else failed++;
});

console.log(`\n=== Summary ===`);
console.log(`Passed: ${passed}/${testCases.length}`);
console.log(`Failed: ${failed}/${testCases.length}`);
