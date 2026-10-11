const express = require('express');
const https = require('https');
const http = require('http');
const TurndownService = require('turndown');
const { decode } = require('html-entities');
const path = require('path');

// Custom fetch that works with both http and https
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const protocol = isHttps ? https : http;
    
    const reqOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      rejectUnauthorized: false
    };
    
    const req = protocol.get(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ ok: res.statusCode < 400, status: res.statusCode, text: () => Promise.resolve(data) }));
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting: 10 requests per minute per IP
const rateLimit = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimit.get(ip);
  if (!record || now - record.start > RATE_WINDOW) {
    rateLimit.set(ip, { start: now, count: 1 });
    return { ok: true, remaining: RATE_LIMIT - 1 };
  }
  if (record.count >= RATE_LIMIT) {
    return { ok: false, remaining: 0, retry: Math.ceil((record.start + RATE_WINDOW - now) / 1000) };
  }
  record.count++;
  return { ok: true, remaining: RATE_LIMIT - record.count };
}

// Rate limit middleware
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const limit = checkRateLimit(ip);
  res.set('X-RateLimit-Limit', RATE_LIMIT);
  res.set('X-RateLimit-Remaining', limit.remaining);
  if (!limit.ok) {
    res.set('Retry-After', limit.retry);
    return res.status(429).json({ error: 'Too many requests', retry: limit.retry });
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS headers for demo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Clean URL prefix - handle various misspellings of http/https
function fixUrlPrefix(s) {
  if (!s || typeof s !== 'string') return s;

  // Remove dangerous characters (preserve unicode for IDN)
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

  // Ensure we have proper protocol
  s = 'https://' + s;

  // Clean up any double/triple slashes
  s = s.replace(/^https:\/+/i, 'https://');

  return s;
}

// Helper: Convert IDN (internationalized) domain to punycode
function toPunycode(hostname) {
  try {
    const { domainToASCII } = require('url');
    return domainToASCII(hostname);
  } catch (e) {
    return hostname;
  }
}

// Parse URL input with tolerance for malformed URLs
function parseUrlInput(input) {
  if (!input || typeof input !== 'string') return null;

  let s = input.trim();
  if (!s) return null;

  // First try to fix the URL prefix
  s = fixUrlPrefix(s);

  // Handle IDN (internationalized domain names) - convert Unicode to punycode
  if (!s.match(/^https?:\/\//i)) {
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

// Turndown service for HTML → Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Add custom rules
turndownService.addRule('removeStyles', {
  filter: ['style', 'script', 'nav', 'footer', 'header', 'aside', 'iframe', 'noscript'],
  replacement: () => ''
});

turndownService.addRule('imgToMarkdown', {
  filter: 'img',
  replacement: (content, node) => {
    const alt = node.alt || '';
    const src = node.src || '';
    return src ? `![${alt}](${src})` : '';
  }
});

// Clean HTML - remove unwanted elements and attributes
function cleanHTML(html) {
  // Remove script, style, nav, footer, header, aside, noscript, iframe
  html = html.replace(/<(script|style|nav|footer|header|aside|noscript|iframe)[^>]*>[\s\S]*?<\/\1>/gi, '');
  
  // Remove on* event handlers
  html = html.replace(/\s+on\w+="[^"]*"/gi, '');
  html = html.replace(/\s+on\w+='[^']*'/gi, '');
  
  // Remove class attributes
  html = html.replace(/\s+class="[^"]*"/gi, '');
  html = html.replace(/\s+class='[^']*'/gi, '');
  
  // Remove id attributes
  html = html.replace(/\s+id="[^"]*"/gi, '');
  html = html.replace(/\s+id='[^']*'/gi, '');
  
  // Remove data-* attributes
  html = html.replace(/\s+data-[a-z-]+="[^"]*"/gi, '');
  html = html.replace(/\s+data-[a-z-]+='[^']*'/gi, '');
  
  return html;
}

// Extract title from HTML
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (match) return decode(match[1]);
  
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return decode(h1Match[1]);
  
  return 'Untitled';
}

// API: Convert URL to Markdown (POST)
app.post('/api/convert', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Parse URL with tolerance for malformed inputs
  const parsed = parseUrlInput(url);
  if (!parsed) {
    return res.status(400).json({ error: 'Invalid URL format: ' + url });
  }

  const targetUrl = parsed.href;

  try {
    console.log(`Fetching: ${targetUrl}`);
    
    const response = await fetchUrl(targetUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: `HTTP error: ${response.status}` });
    }

    const html = await response.text();

    // Clean the HTML
    const cleanedHTML = cleanHTML(html);

    // Extract title
    const title = extractTitle(cleanedHTML);

    // Convert to Markdown
    const markdown = turndownService.turndown(cleanedHTML);

    res.json({
      url: targetUrl,
      title,
      markdown,
      length: markdown.length
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// API: Convert URL to Markdown (GET) - for URLs like /https://example.com or /example.com
app.get('/api/convert/*', async (req, res) => {
  const urlPath = req.params[0];

  if (!urlPath) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // URL decode and parse with tolerance
  const decodedUrl = decodeURIComponent(urlPath);
  const parsed = parseUrlInput(decodedUrl);
  if (!parsed) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    console.log(`Fetching: ${parsed.href}`);

    const response = await fetchUrl(parsed.href);

    if (!response.ok) {
      return res.status(response.status).json({ error: `HTTP error: ${response.status}` });
    }

    const html = await response.text();

    // Clean the HTML
    const cleanedHTML = cleanHTML(html);

    // Extract title
    const title = extractTitle(cleanedHTML);

    // Convert to Markdown
    const markdown = turndownService.turndown(cleanedHTML);

    res.json({
      url: parsed.href,
      title,
      markdown,
      length: markdown.length
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Also handle /http:// and /https:// paths directly
app.get(/^\/(https?:\/\/.*)/, async (req, res) => {
  const urlPath = req.params[0];

  const parsed = parseUrlInput(urlPath);
  if (!parsed) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    console.log(`Fetching: ${parsed.href}`);

    const response = await fetchUrl(parsed.href);

    if (!response.ok) {
      return res.status(response.status).json({ error: `HTTP error: ${response.status}` });
    }

    const html = await response.text();

    // Clean the HTML
    const cleanedHTML = cleanHTML(html);

    // Extract title
    const title = extractTitle(cleanedHTML);

    // Convert to Markdown
    const markdown = turndownService.turndown(cleanedHTML);

    res.json({
      url: parsed.href,
      title,
      markdown,
      length: markdown.length
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Handle plain domain URLs like /example.com (without protocol)
app.get(/^\/([a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}.*)/, async (req, res) => {
  const urlPath = req.params[0];

  const parsed = parseUrlInput(urlPath);
  if (!parsed) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    console.log(`Fetching: ${parsed.href}`);

    const response = await fetchUrl(parsed.href);

    if (!response.ok) {
      return res.status(response.status).json({ error: `HTTP error: ${response.status}` });
    }

    const html = await response.text();

    // Clean the HTML
    const cleanedHTML = cleanHTML(html);

    // Extract title
    const title = extractTitle(cleanedHTML);

    // Convert to Markdown
    const markdown = turndownService.turndown(cleanedHTML);

    res.json({
      url: parsed.href,
      title,
      markdown,
      length: markdown.length
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 2md.link server running at http://0.0.0.0:${PORT}`);
});
