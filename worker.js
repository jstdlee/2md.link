export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
        }
      });
    }

    // Static pages
    if (url.pathname === '/robots.txt') {
      return new Response(ROBOTS_TXT, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    if (url.pathname === '/sitemap.xml') {
      return new Response(SITEMAP_XML, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' }
      });
    }
    if (url.pathname === '/rss.xml') {
      return new Response(RSS_XML, {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
      });
    }
    if (url.pathname === '/help' || url.pathname === '/philosophy') {
      return new Response(HELP_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Handle favicon.ico
    if (url.pathname === '/favicon.ico') {
      return new Response(FAVICON_SVG, {
        headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' }
      });
    }

    if (url.pathname === '/api/convert' && request.method === 'POST') {
      return handleConvert(request);
    }

    // Handle GET requests: /api/convert/*, /http://*, /https://*, /domain.com
    if (request.method === 'GET') {
      const path = decodeURIComponent(url.pathname);

      // Handle /api/convert/* path
      if (path.startsWith('/api/convert/')) {
        const urlPart = path.slice('/api/convert/'.length);
        return handleConvertURL(urlPart);
      }

      // Handle /http:// or /https:// or /ttp:// or any malformed protocol
      if (path.match(/^\/([a-zA-Z]*:)?\/\//)) {
        // Extract URL from path (remove leading slash, handle any protocol prefix)
        let urlPath = path.slice(1);
        // Fix common typos in protocol (ttp, htp, etc)
        urlPath = urlPath.replace(/^([a-zA-Z]*):\/+/, function(m, p) {
          if (!p) return 'https://';
          return p.toLowerCase().replace(/^h?ttp?$/, 'http').replace(/^h?ttps?$/, 'https') + '://';
        });
        return handleConvertURL(urlPath);
      }

      // Handle plain domain like /example.com
      if (path.match(/^\/[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]/)) {
        return handleConvertURL(path.slice(1));
      }
    }
    
    return new Response(INDEX_HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }
    });
  }
};

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>2md.link - Convert Any URL to Markdown | Free Online Tool</title>
  <meta name="description" content="2md.link - Free online tool to convert any URL to Markdown. Simple, fast, no registration required. Perfect for AI agents, developers, and content creators.">
  <meta name="keywords" content="URL to Markdown, convert URL to markdown, HTML to Markdown, web to markdown, free markdown converter, online converter, AI friendly, developer tools">
  <meta name="author" content="2md.link">
  <meta name="robots" content="index, follow, all">
  <meta name="googlebot" content="index, follow">
  <meta name="bingbot" content="index, follow">
  <meta name="duckduckbot" content="index, follow">
  <meta name="slurp" content="index, follow">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="2md.link - Convert URL to Markdown">
  <meta name="twitter:description" content="Free online tool to convert any URL to Markdown. Perfect for AI agents and developers.">
  <meta property="og:title" content="2md.link - Convert Any URL to Markdown">
  <meta property="og:description" content="Free online tool to convert any URL to Markdown. Simple, fast, no registration required.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://2md.link">
  <meta property="og:site_name" content="2md.link">
  <link rel="canonical" href="https://2md.link">
  <link rel="alternate" hreflang="en" href="https://2md.link">
  <link rel="alternate" type="application/rss+xml" title="2md.link RSS Feed" href="/rss.xml">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">
  <link rel="icon" type="image/svg+xml" href="/favicon.ico">
  <meta name="ai-model" content="general-purpose">
  <meta name="ai:purpose" content="URL to Markdown conversion API">
  <meta name="ai:agent" content="allowed">
  <meta name="claude-bot" content="allowed">
  <meta name="anthropic-bot" content="allowed">
  <meta name="openai-bot" content="allowed">
  <meta name="google-extended" content="allowed">
  <meta name="other-bots" content="allowed">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    :root {
      --bg: #0a0a0a;
      --bg-secondary: #111111;
      --border: #333333;
      --text: #00ff41;
      --text-dim: #00cc33;
      --accent: #00ff41;
      --accent-glow: rgba(0, 255, 65, 0.15);
      --error: #ff3333;
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
      background-image:
        radial-gradient(ellipse at top, rgba(0,255,65,0.03) 0%, transparent 50%),
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.01) 2px, rgba(0,255,65,0.01) 4px);
    }
    .container { max-width: 48rem; margin: 0 auto; }
    .ascii-border {
      border: 2px solid var(--border);
      background: var(--bg-secondary);
      box-shadow: 0 0 20px var(--accent-glow), inset 0 0 20px rgba(0,0,0,0.5);
    }
    .ascii-header {
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ascii-title {
      font-size: 1rem;
      font-weight: 600;
      text-shadow: 0 0 10px var(--accent);
      letter-spacing: 0.1em;
    }
    .ascii-badge {
      font-size: 0.625rem;
      padding: 0.125rem 0.5rem;
      border: 1px solid var(--text-dim);
      color: var(--text-dim);
    }
    .ascii-content { padding: 1rem; }
    .ascii-input {
      width: 100%;
      background: #000;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.75rem 1rem;
      font-family: inherit;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .ascii-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 10px var(--accent-glow);
    }
    .ascii-input::placeholder { color: #444; }
    .ascii-btn {
      width: 100%;
      margin-top: 0.75rem;
      background: transparent;
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 0.625rem 1rem;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      transition: all 0.2s;
    }
    .ascii-btn:hover:not(:disabled) {
      background: var(--accent);
      color: #000;
      box-shadow: 0 0 20px var(--accent-glow);
    }
    .ascii-btn:disabled {
      border-color: #444;
      color: #444;
      cursor: not-allowed;
    }
    .ascii-error {
      background: rgba(255,51,51,0.1);
      border: 1px solid var(--error);
      color: var(--error);
      padding: 0.75rem;
      margin-top: 0.75rem;
      font-size: 0.75rem;
      display: none;
    }
    .ascii-loading {
      color: var(--text-dim);
      padding: 2rem;
      text-align: center;
      display: none;
      font-size: 0.875rem;
      animation: blink 1s infinite;
    }
    @keyframes blink { 50% { opacity: 0.5; } }
    .ascii-result {
      display: none;
      flex-direction: column;
      margin-top: 1rem;
    }
    .ascii-result-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }
    .ascii-result-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-dim);
      padding: 0.375rem 0.75rem;
      font-family: inherit;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ascii-result-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .ascii-info {
      font-size: 0.625rem;
      padding: 0.125rem 0.5rem;
      border: 1px solid var(--border);
      color: #666;
    }
    .ascii-textarea {
      width: 100%;
      min-height: 50vh;
      background: #000;
      border: none;
      color: var(--text-dim);
      padding: 1rem;
      font-family: inherit;
      font-size: 0.75rem;
      line-height: 1.6;
      resize: vertical;
      outline: none;
    }
    .ascii-footer {
      text-align: center;
      padding: 1rem;
      font-size: 0.75rem;
      color: #666;
      border-top: 1px solid var(--border);
    }
    .ascii-footer .footer-link {
      color: var(--text-dim);
      text-decoration: none;
      margin: 0 0.5rem;
    }
    .ascii-footer .footer-link:hover {
      color: var(--accent);
      text-decoration: underline;
    }
    .ascii-footer .copyright {
      color: #555;
      font-size: 0.625rem;
      display: block;
      margin-top: 0.5rem;
    }
    /* Tabs */
    .tabs-container { margin-top: 1rem; }
    .tabs-header {
      display: flex;
      flex-wrap: wrap;
      border-bottom: 1px solid var(--border);
      gap: 0.25rem;
    }
    .tab-btn {
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: #666;
      padding: 0.5rem 0.75rem;
      font-family: inherit;
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
      flex: 0 0 auto;
    }
    @media (max-width: 640px) {
      .tabs-header {
        gap: 0.125rem;
      }
      .tab-btn {
        padding: 0.4rem 0.5rem;
        font-size: 0.6rem;
      }
    }
    }
    .tab-btn:hover { color: var(--text-dim); }
    .tab-btn.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
    .tab-content {
      display: none;
      padding: 0.75rem;
      background: #000;
      border: 1px solid var(--border);
      border-top: none;
    }
    .tab-content.active { display: block; }
    .code-block {
      font-size: 0.7rem;
      line-height: 1.5;
      color: var(--text-dim);
      white-space: pre-wrap;
      word-break: break-all;
    }
    .code-block .keyword { color: #ff79c6; }
    .code-block .string { color: #f1fa8c; }
    .code-block .comment { color: #6272a4; }
    @media (max-width: 640px) {
      body { padding: 0.5rem; }
      .ascii-content { padding: 0.75rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="ascii-border">
      <div class="ascii-header">
        <span class="ascii-title">&gt; 2MD.LINK_</span>
        <span class="ascii-badge">v1.0</span>
      </div>
      <div class="ascii-content">
        <input type="text" id="urlInput" class="ascii-input" placeholder="example.com or https://..." autocomplete="off">
        <button id="convertBtn" class="ascii-btn">[ CONVERT TO MARKDOWN ]</button>
        <div id="error" class="ascii-error"></div>
        <div id="loading" class="ascii-loading">&gt; FETCHING DATA...</div>
        <div id="result" class="ascii-result">
          <div class="ascii-result-header">
            <button id="copyBtn" class="ascii-result-btn">COPY</button>
            <button id="downloadBtn" class="ascii-result-btn">SAVE</button>
            <span id="resultInfo" class="ascii-info"></span>
          </div>
          <textarea id="markdownOutput" class="ascii-textarea" readonly></textarea>
        </div>
      </div>
      <div class="tabs-container">
        <div class="tabs-header">
          <button class="tab-btn active" data-tab="curl">curl</button>
          <button class="tab-btn" data-tab="python">Python</button>
          <button class="tab-btn" data-tab="typescript">TypeScript</button>
          <button class="tab-btn" data-tab="go">Go</button>
          <button class="tab-btn" data-tab="rust">Rust</button>
          <button class="tab-btn" data-tab="ruby">Ruby</button>
          <button class="tab-btn" data-tab="java">Java</button>
          <button class="tab-btn" data-tab="php">PHP</button>
          <button class="tab-btn" data-tab="csharp">C#</button>
          <button class="tab-btn" data-tab="swift">Swift</button>
          <button class="tab-btn" data-tab="bash">Bash</button>
        </div>

        <!-- curl - POST -->
        <div id="tab-curl" class="tab-content active">
          <div class="code-block"><span class="comment"># POST - Convert URL to markdown</span>
<span class="comment"># cURL</span>
curl -X POST https://2md.link/api/convert \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

<span class="comment"># GET - Simple URL pass</span>
curl https://2md.link/api/convert/example.com

<span class="comment"># GET - With protocol</span>
curl https://2md.link/https://example.com</div>
        </div>

        <!-- Python -->
        <div id="tab-python" class="tab-content">
          <div class="code-block"><span class="comment"># POST - Python requests</span>
<span class="keyword">import</span> requests

url = <span class="string">"https://2md.link/api/convert"</span>
data = {<span class="string">"url"</span>: <span class="string">"https://example.com"</span>}
r = requests.post(url, json=data)
<span class="keyword">print</span>(r.json()[<span class="string">"markdown"</span>])

<span class="comment"># GET - Python</span>
r = requests.get(<span class="string">"https://2md.link/api/convert/example.com"</span>)
<span class="keyword">print</span>(r.json()[<span class="string">"markdown"</span>])</div>
        </div>

        <!-- TypeScript -->
        <div id="tab-typescript" class="tab-content">
          <div class="code-block"><span class="comment">// POST - TypeScript/Fetch</span>
<span class="keyword">const</span> res = <span class="keyword">await</span> fetch(<span class="string">"https://2md.link/api/convert"</span>, {
  method: <span class="string">"POST"</span>,
  headers: { <span class="string">"Content-Type"</span>: <span class="string">"application/json"</span> },
  body: JSON.stringify({ url: <span class="string">"https://example.com"</span> })
});
<span class="keyword">const</span> { markdown } = <span class="keyword">await</span> res.json();

<span class="comment">// GET - TypeScript</span>
<span class="keyword">const</span> res = <span class="keyword">await</span> fetch(<span class="string">"https://2md.link/api/convert/example.com"</span>);
<span class="keyword">const</span> { markdown } = <span class="keyword">await</span> res.json();</div>
        </div>

        <!-- Go -->
        <div id="tab-go" class="tab-content">
          <div class="code-block"><span class="comment">// POST - Go</span>
<span class="keyword">package</span> main

<span class="keyword">import</span> (
  <span class="string">"encoding/json"</span>
  <span class="string">"fmt"</span>
  <span class="string">"net/http"</span>
  <span class="string">"bytes"</span>
)

<span class="keyword">func</span> main() {
  data := map[string]string{<span class="string">"url"</span>: <span class="string">"https://example.com"</span>}
  jsonData, _ := json.Marshal(data)
  resp, _ := http.Post(<span class="string">"https://2md.link/api/convert"</span>,
    <span class="string">"application/json"</span>, bytes.NewBuffer(jsonData))
  <span class="keyword">defer</span> resp.Body.Close()
  <span class="comment">// ... handle response</span>
}

<span class="comment">// GET - Go</span>
resp, _ := http.Get(<span class="string">"https://2md.link/api/convert/example.com"</span>)</div>
        </div>

        <!-- Rust -->
        <div id="tab-rust" class="tab-content">
          <div class="code-block"><span class="comment">// POST - Rust</span>
<span class="keyword">use</span> reqwest;
<span class="keyword">use</span> serde_json::json;

[<span class="keyword">tokio</span>::main]
<span class="keyword">async fn</span> main() -> Result<(), reqwest::Error> {
  <span class="keyword">let</span> client = reqwest::Client::new();
  <span class="keyword">let</span> res = client.post(<span class="string">"https://2md.link/api/convert"</span>)
    .json(&json!({<span class="string">"url"</span>: <span class="string">"https://example.com"</span>}))
    .send()
    .await?;
  <span class="keyword">let</span> body = res.text().await?;
  <span class="comment">// ... handle response</span>
}

<span class="comment">// GET - Rust</span>
<span class="keyword">let</span> res = client.get(<span class="string">"https://2md.link/api/convert/example.com"</span>).send().await?;</div>
        </div>

        <!-- Ruby -->
        <div id="tab-ruby" class="tab-content">
          <div class="code-block"><span class="comment"># POST - Ruby</span>
<span class="keyword">require</span> <span class="string">'net/http'</span>
<span class="keyword">require</span> <span class="string">'json'</span>

uri = URI(<span class="string">'https://2md.link/api/convert'</span>)
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = <span class="keyword">true</span>
req = Net::HTTP::Post.new(uri)
req[<span class="string">'Content-Type'</span>] = <span class="string">'application/json'</span>
req.body = { url: <span class="string">'https://example.com'</span> }.to_json
res = http.request(req)
puts JSON.parse(res.body)[<span class="string">'markdown'</span>]

<span class="comment"># GET - Ruby</span>
res = Net::HTTP.get_response(<span class="string">'2md.link'</span>, <span class="string">'/api/convert/example.com'</span>)</div>
        </div>

        <!-- Java -->
        <div id="tab-java" class="tab-content">
          <div class="code-block"><span class="comment">// POST - Java</span>
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create(<span class="string">"https://2md.link/api/convert"</span>))
  .header(<span class="string">"Content-Type"</span>, <span class="string">"application/json"</span>)
  .POST(HttpRequest.BodyPublishers.ofString(<span class="string">"{\\"url\\":\\"https://example.com\\"}"</span>))
  .build();
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

<span class="comment">// GET - Java</span>
HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create(<span class="string">"https://2md.link/api/convert/example.com"</span>))
  .GET()
  .build();</div>
        </div>

        <!-- PHP -->
        <div id="tab-php" class="tab-content">
          <div class="code-block"><span class="comment">&lt;?php</span>
<span class="comment">// POST - PHP</span>
$ch = curl_init(<span class="string">"https://2md.link/api/convert"</span>);
curl_setopt($ch, CURLOPT_POST, <span class="keyword">true</span>);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  <span class="string">"url"</span> => <span class="string">"https://example.com"</span>
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [<span class="string">"Content-Type: application/json"</span>]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, <span class="keyword">true</span>);
$response = curl_exec($ch);
$data = json_decode($response, <span class="keyword">true</span>);
<span class="keyword">echo</span> $data[<span class="string">"markdown"</span>];

<span class="comment">// GET - PHP</span>
$response = file_get_contents(<span class="string">"https://2md.link/api/convert/example.com"</span>);</div>
        </div>

        <!-- C# -->
        <div id="tab-csharp" class="tab-content">
          <div class="code-block"><span class="comment">// POST - C#</span>
<span class="keyword">using</span> System.Net.Http;
<span class="keyword">using</span> System.Text.Json;

<span class="keyword">var</span> client = <span class="keyword">new</span> HttpClient();
<span class="keyword">var</span> content = <span class="keyword">new</span> StringContent(
  JsonSerializer.Serialize(<span class="keyword">new</span> { url = <span class="string">"https://example.com"</span> }),
  Encoding.UTF8,
  <span class="string">"application/json"</span>
);
<span class="keyword">var</span> response = await client.PostAsync(<span class="string">"https://2md.link/api/convert"</span>, content);
<span class="keyword">var</span> result = JsonSerializer.DeserializeAsync&lt;JsonElement&gt;(response.Content.ReadAsStream());

<span class="comment">// GET - C#</span>
<span class="keyword">var</span> response = await client.GetAsync(<span class="string">"https://2md.link/api/convert/example.com"</span>);</div>
        </div>

        <!-- Swift -->
        <div id="tab-swift" class="tab-content">
          <div class="code-block"><span class="comment">// POST - Swift</span>
<span class="keyword">import</span> Foundation

<span class="keyword">let</span> url = URL(string: <span class="string">"https://2md.link/api/convert"</span>)!
<span class="keyword">var</span> request = URLRequest(url: url)
request.httpMethod = <span class="string">"POST"</span>
request.setValue(<span class="string">"application/json"</span>, forHTTPHeaderField: <span class="string">"Content-Type"</span>)
request.httpBody = try! JSONEncoder().encode([<span class="string">"url"</span>: <span class="string">"https://example.com"</span>])

<span class="keyword">let</span> (data, _) = try! await URLSession.shared.data(for: request)

<span class="comment">// GET - Swift</span>
<span class="keyword">let</span> url = URL(string: <span class="string">"https://2md.link/api/convert/example.com"</span>)!
<span class="keyword">let</span> (data, _) = try! await URLSession.shared.data(from: url)</div>
        </div>

        <!-- Bash -->
        <div id="tab-bash" class="tab-content">
          <div class="code-block"><span class="comment">#!/bin/bash</span>
<span class="comment"># POST - Bash</span>
curl -X POST https://2md.link/api/convert \
  -H <span class="string">"Content-Type: application/json"</span> \
  -d <span class="string">'{"url":"https://example.com"}'</span>

<span class="comment"># GET - Bash</span>
curl https://2md.link/api/convert/example.com

<span class="comment"># wget alternative</span>
wget -qO- --post-data=<span class="string">'{"url":"https://example.com"}'</span> \
  --header=<span class="string">"Content-Type: application/json"</span> \
  https://2md.link/api/convert</div>
        </div>
      </div>
      <div class="ascii-footer">
        <a href="/sitemap.xml" class="footer-link">Sitemap</a> |
        <a href="/rss.xml" class="footer-link">RSS</a> |
        <a href="/help" class="footer-link">Help/Philosophy</a> |
        <a href="mailto:support@2md.link" class="footer-link">Contact</a>
        <br>
        <span class="copyright">&copy; 2026 2md.link - All rights reserved</span>
      </div>
    </div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var urlInput = document.getElementById('urlInput');
      var convertBtn = document.getElementById('convertBtn');
      var resultDiv = document.getElementById('result');
      var errorDiv = document.getElementById('error');
      var loadingDiv = document.getElementById('loading');
      var markdownOutput = document.getElementById('markdownOutput');
      var resultInfo = document.getElementById('resultInfo');
      var copyBtn = document.getElementById('copyBtn');
      var downloadBtn = document.getElementById('downloadBtn');
      var tabBtns = document.querySelectorAll('.tab-btn');
      var tabContents = document.querySelectorAll('.tab-content');

      // Tab switching
      tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          tabBtns.forEach(function(b) { b.classList.remove('active'); });
          tabContents.forEach(function(c) { c.classList.remove('active'); });
          btn.classList.add('active');
          document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
      });

      function fixUrlPrefix(s) {
        if (!s || typeof s !== 'string') return s;

        // Remove dangerous characters
        s = s.replace(/[<>"'()]/g, '');

        // Convert to lowercase for matching
        var lower = s.toLowerCase();

        // Check and remove protocol-like prefixes using simple string operations
        if (lower.indexOf('http://') === 0) {
          s = s.substring(7);
        } else if (lower.indexOf('https://') === 0) {
          s = s.substring(8);
        } else if (lower.indexOf('http:') === 0) {
          s = s.substring(5);
        } else if (lower.indexOf('https:') === 0) {
          s = s.substring(6);
        } else if (lower.indexOf('ttp://') === 0) {
          s = s.substring(6);
        } else if (lower.indexOf('htp://') === 0) {
          s = s.substring(6);
        } else if (lower.indexOf('ttp:') === 0) {
          s = s.substring(4);
        } else if (lower.indexOf('htp:') === 0) {
          s = s.substring(4);
        } else if (lower.indexOf('tp://') === 0) {
          s = s.substring(5);
        } else if (lower.indexOf('tp:') === 0) {
          s = s.substring(3);
        }

        // Remove any leading slashes
        while (s.length > 0 && s.charAt(0) === '/') {
          s = s.substring(1);
        }

        // Remove any leading colons
        while (s.length > 0 && s.charAt(0) === ':') {
          s = s.substring(1);
        }

        // Remove slashes again after removing colons
        while (s.length > 0 && s.charAt(0) === '/') {
          s = s.substring(1);
        }

        // Ensure we have proper protocol
        s = 'https://' + s;

        return s;
      }

      function parseUrlInput(input) {
        if (!input || typeof input !== 'string') return null;
        var s = input.trim();
        if (!s) return null;
        s = fixUrlPrefix(s);
        if (s.indexOf('://') > 0) {
          try { return new URL(s); } catch (e) { return null; }
        }
        try { return new URL('https://' + s); } catch (e) {}
        try { return new URL('http://' + s); } catch (e) {}
        return null;
      }

      function doConvert() {
        var input = urlInput.value;
        if (!input) { showError('ERROR: Please enter a URL'); return; }
        var parsed = parseUrlInput(input);
        if (!parsed) { showError('ERROR: Invalid URL - ' + input); return; }
        hideAll();
        loadingDiv.style.display = 'block';
        convertBtn.disabled = true;
        convertBtn.textContent = '[ PROCESSING... ]';

        fetch('/api/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: parsed.href })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          loadingDiv.style.display = 'none';
          convertBtn.disabled = false;
          convertBtn.textContent = '[ CONVERT TO MARKDOWN ]';
          if (data.error) { showError('ERROR: ' + data.error); return; }
          var info = (data.length || 0) + ' chars';
          if (data.redirected) info += ' | redirected';
          resultInfo.textContent = info;
          markdownOutput.value = data.markdown || '';
          resultDiv.style.display = 'flex';
        })
        .catch(function(err) {
          loadingDiv.style.display = 'none';
          convertBtn.disabled = false;
          convertBtn.textContent = '[ CONVERT TO MARKDOWN ]';
          showError('ERROR: ' + err.message);
        });
      }

      function showError(msg) {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
        loadingDiv.style.display = 'none';
      }
      function hideAll() {
        errorDiv.style.display = 'none';
        resultDiv.style.display = 'none';
      }

      // Attach event handlers
      convertBtn.addEventListener('click', doConvert);
      urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') doConvert();
      });

      downloadBtn.addEventListener('click', function() {
        var blob = new Blob([markdownOutput.value], { type: 'text/markdown' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'document.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });

      copyBtn.addEventListener('click', function() {
        markdownOutput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'COPIED!';
        setTimeout(function() { copyBtn.textContent = 'COPY'; }, 2000);
      });
    });
  </script>
</body>
</html>`;

const ROBOTS_TXT = `User-agent: *
Allow: /
Allow: /api/
Disallow: /api/convert$

# Sitemap
Sitemap: https://2md.link/sitemap.xml

# AI Bots
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Anthropic-ai
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: *
Allow: /
`;

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://2md.link/</loc>
    <lastmod>2026-02-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://2md.link/help</loc>
    <lastmod>2026-02-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://2md.link/api/convert</loc>
    <lastmod>2026-02-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://2md.link/robots.txt</loc>
    <lastmod>2026-02-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://2md.link/rss.xml</loc>
    <lastmod>2026-02-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

const RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>2md.link - URL to Markdown Converter</title>
    <link>https://2md.link</link>
    <description>Free online tool to convert any URL to Markdown. Perfect for AI agents, developers, and content creators.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://2md.link/rss.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>2md.link - Convert Any URL to Markdown</title>
      <link>https://2md.link</link>
      <description>Free URL to Markdown conversion API. Simple GET and POST endpoints. Works with all programming languages.</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid>https://2md.link</guid>
    </item>
    <item>
      <title>API Documentation</title>
      <link>https://2md.link/api/convert</link>
      <description>Learn how to use the 2md.link API for URL to Markdown conversion.</description>
      <pubDate>2026-02-19</pubDate>
      <guid>https://2md.link/api/convert</guid>
    </item>
  </channel>
</rss>`;

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#0a0a0a"/>
  <text x="16" y="22" font-family="monospace" font-size="18" font-weight="bold" fill="#00ff41" text-anchor="middle">2md</text>
</svg>`;

const HELP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Help & Philosophy - 2md.link</title>
  <meta name="description" content="Learn about 2md.link philosophy, why we offer free URL to Markdown conversion, and why we don't use Cloudflare Edge.">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    :root {
      --bg: #0a0a0a;
      --bg-secondary: #111111;
      --border: #333333;
      --text: #00ff41;
      --text-dim: #00cc33;
      --accent: #00ff41;
      --accent-glow: rgba(0, 255, 65, 0.15);
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .container { max-width: 48rem; margin: 0 auto; }
    .ascii-border {
      border: 2px solid var(--border);
      background: var(--bg-secondary);
      box-shadow: 0 0 20px var(--accent-glow), inset 0 0 20px rgba(0,0,0,0.5);
    }
    .ascii-header {
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ascii-title {
      font-size: 1rem;
      font-weight: 600;
      text-shadow: 0 0 10px var(--accent);
      letter-spacing: 0.1em;
    }
    .ascii-content { padding: 1.5rem; }
    h1 { font-size: 1.5rem; margin: 0 0 1rem; color: var(--accent); }
    h2 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; color: var(--text-dim); border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    p { line-height: 1.7; margin: 0.75rem 0; color: #ccc; }
    ul { margin: 0.75rem 0; padding-left: 1.5rem; }
    li { line-height: 1.7; margin: 0.5rem 0; color: #ccc; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #000; padding: 0.125rem 0.375rem; border-radius: 3px; color: var(--text-dim); }
    pre { background: #000; padding: 1rem; overflow-x: auto; border-radius: 4px; }
    .ascii-footer {
      text-align: center;
      padding: 1rem;
      font-size: 0.75rem;
      color: #666;
      border-top: 1px solid var(--border);
    }
    .ascii-footer a {
      color: var(--text-dim);
      margin: 0 0.5rem;
    }
    .ascii-footer a:hover { color: var(--accent); }
    .ascii-footer .copyright {
      color: #555;
      font-size: 0.625rem;
      display: block;
      margin-top: 0.5rem;
    }
    .back-link {
      display: inline-block;
      margin-bottom: 1rem;
      color: var(--text-dim);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="ascii-border">
      <div class="ascii-header">
        <span class="ascii-title">&gt; 2MD.LINK_</span>
        <span class="ascii-title" style="font-size: 0.75rem;">HELP</span>
      </div>
      <div class="ascii-content">
        <a href="/" class="back-link">&larr; Back to Converter</a>

        <h1>Philosophy & Help</h1>

        <h2>Why 2md.link?</h2>
        <p>2md.link exists because we believe <strong>URL to Markdown conversion should be free and accessible to everyone</strong>. Whether you're:</p>
        <ul>
          <li>An AI agent or bot needing to fetch web content in markdown format</li>
          <li>A developer building a tool that needs HTML to Markdown conversion</li>
          <li>A content creator who wants to quickly grab web content</li>
          <li>A researcher collecting data from the web</li>
        </ul>
        <p>You shouldn't need to pay for a simple conversion API.</p>

        <h2>Why Free?</h2>
        <p>We keep this service free because:</p>
        <ul>
          <li><strong>No registration required</strong> - Use it instantly without signing up</li>
          <li><strong>Open to all bots/AI</strong> - We explicitly allow AI agents, scrapers, and crawlers</li>
          <li><strong>No paywalls</strong> - Everyone deserves access to this basic utility</li>
          <li><strong>Simple infrastructure</strong> - We use efficient, minimal infrastructure to keep costs low</li>
        </ul>

        <h2>Why Not Cloudflare Edge?</h2>
        <p>You might wonder why we don't use Cloudflare's Edge workers for this. Here's why:</p>
        <ul>
          <li><strong>Bot detection</strong> - Cloudflare's Edge aggressively blocks bots, which defeats the purpose of an AI-friendly API</li>
          <li><strong>JavaScript rendering</strong> - Edge workers can't render JavaScript, so dynamic sites return incomplete content</li>
          <li><strong>IP blocking</strong> - Cloudflare's WAF often blocks requests from data centers</li>
        </ul>

        <h2>Why Do Some Sites Return 500 Errors?</h2>
        <p>Sometimes when you try to convert a URL, you might get a 500 error or incomplete content. Here's why:</p>
        <ul>
          <li><strong>CAPTCHA Challenges</strong> - Many sites (Google, Facebook, Twitter, etc.) use anti-bot protection that shows a CAPTCHA or verification page instead of the real content</li>
          <li><strong>JavaScript Rendering</strong> - Sites that heavily rely on JavaScript (SPAs, React, Vue apps) may not render properly without a browser</li>
          <li><strong>Bot Detection</strong> - Some sites actively block requests from data centers or unknown IP addresses</li>
          <li><strong>Rate Limiting</strong> - Popular sites may temporarily block repeated requests from the same source</li>
        </ul>
        <p><strong>Works well with:</strong> Wikipedia, blogs, documentation sites, news sites, static websites, and most sites without aggressive bot protection.</p>
          <li><strong>Direct fetch</strong> - Our approach fetches directly from the origin server, giving you real content</li>
        </ul>
        <p>While Cloudflare is great for hosting, it's not ideal for a tool that needs to fetch from other sites freely.</p>

        <h2>Agent & AI Friendly</h2>
        <p>2md.link is built specifically for AI agents and bots:</p>
        <ul>
          <li>No JavaScript rendering required</li>
          <li>Simple REST API with GET and POST support</li>
          <li>JSON responses easy to parse</li>
          <li>No rate limiting for reasonable use</li>
          <li>No captchas or bot detection</li>
          <li>Explicitly allowed in robots.txt</li>
          <li>RSS feed for monitoring updates</li>
        </ul>

        <h2>API Usage</h2>
        <p><strong>POST Request:</strong></p>
        <pre>curl -X POST https://2md.link/api/convert \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com"}'</pre>

        <p><strong>GET Request:</strong></p>
        <pre>curl https://2md.link/api/convert/example.com</pre>

        <p><strong>Direct URL:</strong></p>
        <pre>curl https://2md.link/https://example.com</pre>

        <h2>Response Format</h2>
        <pre>{
  "url": "https://example.com/",
  "title": "Example Domain",
  "markdown": "# Example Domain\\n\\nThis domain is for use...",
  "length": 181,
  "redirected": false
}</pre>

        <h2>Contact</h2>
        <p>Questions? Suggestions? Just want to say hi?</p>
        <p>Email: <a href="mailto:support@2md.link">support@2md.link</a></p>

        <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">
          Made with &lt;3 for the open web. Available to all AI agents, bots, and humans alike.
        </p>
      </div>
      <div class="ascii-footer">
        <a href="/sitemap.xml">Sitemap</a> |
        <a href="/rss.xml">RSS</a> |
        <a href="/help">Help</a> |
        <a href="mailto:support@2md.link">Contact</a>
        <br>
        <span class="copyright">&copy; 2026 2md.link - All rights reserved</span>
      </div>
    </div>
  </div>
</body>
</html>`;


// Backend
var rateLimit = new Map();
var FREE_LIMIT = 10;
var WINDOW = 60000;

function checkLimit(key) {
  var now = Date.now();
  var rec = rateLimit.get(key);
  if (!rec || now - rec.start > WINDOW) {
    rateLimit.set(key, { start: now, count: 1 });
    return { ok: true, remaining: FREE_LIMIT - 1 };
  }
  if (rec.count >= FREE_LIMIT) {
    return { ok: false, remaining: 0, retry: Math.ceil((rec.start + WINDOW - now) / 1000) };
  }
  rec.count++;
  return { ok: true, remaining: FREE_LIMIT - rec.count };
}

function fixUrlPrefix(s) {
  if (!s || typeof s !== 'string') return s;

  // Remove dangerous characters
  s = s.replace(/[<>"'()]/g, '');

  // Convert to lowercase for matching
  var lower = s.toLowerCase();

  // Check and remove protocol-like prefixes using simple string operations
  if (lower.indexOf('http://') === 0) {
    s = s.substring(7);
  } else if (lower.indexOf('https://') === 0) {
    s = s.substring(8);
  } else if (lower.indexOf('http:') === 0) {
    s = s.substring(5);
  } else if (lower.indexOf('https:') === 0) {
    s = s.substring(6);
  } else if (lower.indexOf('ttp://') === 0) {
    s = s.substring(6);
  } else if (lower.indexOf('htp://') === 0) {
    s = s.substring(6);
  } else if (lower.indexOf('ttp:') === 0) {
    s = s.substring(4);
  } else if (lower.indexOf('htp:') === 0) {
    s = s.substring(4);
  } else if (lower.indexOf('tp://') === 0) {
    s = s.substring(5);
  } else if (lower.indexOf('tp:') === 0) {
    s = s.substring(3);
  }

  // Remove any leading slashes
  while (s.length > 0 && s.charAt(0) === '/') {
    s = s.substring(1);
  }

  // Remove any leading colons
  while (s.length > 0 && s.charAt(0) === ':') {
    s = s.substring(1);
  }

  // Remove slashes again after removing colons
  while (s.length > 0 && s.charAt(0) === '/') {
    s = s.substring(1);
  }

  // Ensure we have proper protocol
  s = 'https://' + s;

  return s;
}

// Handle IDN (internationalized domain names) - convert Unicode to punycode
function toPunycode(hostname) {
  try {
    // Use a simple punycode encoder for common cases
    // For Cloudflare Workers, we implement a basic version
    var encoded = '';
    if (hostname.indexOf('xn--') === -1) {
      // Has unicode, try to convert
      try {
        encoded = new URL('https://' + hostname).hostname;
        return encoded;
      } catch (e) {
        return hostname;
      }
    }
    return hostname;
  } catch (e) {
    return hostname;
  }
}

function parseUrlInput(input) {
  if (!input || typeof input !== 'string') return null;
  var s = input.trim();
  if (!s) return null;
  s = fixUrlPrefix(s);

  // Handle IDN (internationalized domain names) - convert Unicode to punycode
  if (s.indexOf('://') === -1) {
    var domainMatch = s.match(/^([a-zA-Z0-9][-a-zA-Z0-9.]*)/);
    if (domainMatch) {
      var domain = domainMatch[1];
      var punycodeDomain = toPunycode(domain);
      if (punycodeDomain !== domain) {
        s = s.replace(domain, punycodeDomain);
      }
    }
  }

  if (s.indexOf('://') > 0) {
    try { return new URL(s); } catch (e) { return null; }
  }
  try { return new URL('https://' + s); } catch (e) {}
  try { return new URL('http://' + s); } catch (e) {}
  return null;
}

function htmlToMd(html) {
  var md = html;

  // First, remove unwanted elements completely
  md = md.replace(/<(script|style|nav|footer|header|aside|noscript|iframe|form|input|button|select|textarea)[^>]*>[\s\S]*?<\/\1>/gi, '');
  md = md.replace(/<!--[\s\S]*?-->/g, '');

  // Remove all event handlers and common attributes
  md = md.replace(/\s+on\w+="[^"]*"/gi, '');
  md = md.replace(/\s+class="[^"]*"/gi, '');
  md = md.replace(/\s+id="[^"]*"/gi, '');
  md = md.replace(/\s+data-[a-z-]+="[^"]*"/gi, '');
  md = md.replace(/\s+aria-[a-z-]+="[^"]*"/gi, '');
  md = md.replace(/\s+role="[^"]*"/gi, '');

  // Handle headings (order matters - process highest first)
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, function(m, content) { return '# ' + stripTags(content).trim() + '\n\n'; });
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, function(m, content) { return '## ' + stripTags(content).trim() + '\n\n'; });
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, function(m, content) { return '### ' + stripTags(content).trim() + '\n\n'; });
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, function(m, content) { return '#### ' + stripTags(content).trim() + '\n\n'; });
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, function(m, content) { return '##### ' + stripTags(content).trim() + '\n\n'; });
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, function(m, content) { return '###### ' + stripTags(content).trim() + '\n\n'; });

  // Handle paragraphs with content
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, function(m, content) {
    var cleaned = stripTags(content).trim();
    return cleaned ? cleaned + '\n\n' : '';
  });

  // Handle div containers that might have content
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, function(m, content) {
    var cleaned = stripTags(content).trim();
    return cleaned ? cleaned + '\n' : '';
  });

  // Handle spans and sections
  md = md.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, function(m, content) { return stripTags(content); });
  md = md.replace(/<section[^>]*>([\s\S]*?)<\/section>/gi, function(m, content) { return stripTags(content).trim() + '\n\n'; });
  md = md.replace(/<article[^>]*>([\s\S]*?)<\/article>/gi, function(m, content) { return stripTags(content).trim() + '\n\n'; });
  md = md.replace(/<main[^>]*>([\s\S]*?)<\/main>/gi, function(m, content) { return stripTags(content).trim() + '\n\n'; });

  // Handle links BEFORE removing other tags
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, function(m, href, text) {
    var linkText = stripTags(text).trim();
    return linkText ? '[' + linkText + '](' + href + ')' : '';
  });

  // Handle images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

  // Handle strong/bold
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, function(m, content) { return '**' + stripTags(content).trim() + '**'; });
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, function(m, content) { return '**' + stripTags(content).trim() + '**'; });

  // Handle emphasis/italic
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, function(m, content) { return '*' + stripTags(content).trim() + '*'; });
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, function(m, content) { return '*' + stripTags(content).trim() + '*'; });

  // Handle code blocks (pre)
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, function(m, content) {
    var code = stripTags(content).trim();
    return '```\n' + code + '\n```\n\n';
  });

  // Handle inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, function(m, content) { return '`' + stripTags(content).trim() + '`'; });

  // Handle line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n');

  // Handle lists - process list items before removing tags
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, function(m, content) { return '- ' + stripTags(content).trim() + '\n'; });

  // Handle tables
  md = md.replace(/<table[^>]*>/gi, '\n');
  md = md.replace(/<\/table>/gi, '\n');
  md = md.replace(/<tr[^>]*>/gi, '| ');
  md = md.replace(/<\/tr>/gi, '\n');
  md = md.replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, function(m, content) { return stripTags(content).trim() + ' | '; });
  md = md.replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, function(m, content) { return stripTags(content).trim() + ' | '; });

  // Handle blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, function(m, content) {
    var lines = stripTags(content).trim().split('\n');
    return lines.map(function(l) { return '> ' + l; }).join('\n') + '\n\n';
  });

  // Remove any remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&#(\d+);/g, function(m, num) { return String.fromCharCode(num); });

  // Clean up whitespace
  md = md.replace(/\[([\s]*)\]/g, ''); // Empty links
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function getTitle(html) {
  var m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1] : 'Untitled';
}

function cleanMd(md) {
  return md.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l; }).join('\n\n');
}

async function fetchWithBestProtocol(urlStr) {
  var urlhttps = urlStr;
  var urlhttp = urlStr.replace(/^https:/i, 'http:');
  
  var results = [];
  var timeout = 5000;

  try {
    var controller = new AbortController();
    var timeoutId = setTimeout(() => controller.abort(), timeout);
    var res = await fetch(urlhttps, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'manual',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.status === 200) {
      var text = await res.text();
      results.push({ url: urlhttps, text: text, redirected: false });
    } else if ([301, 302, 303, 307, 308].indexOf(res.status) !== -1) {
      var location = res.headers.get('location');
      if (location) {
        var newUrl = new URL(location, urlhttps).href;
        var rc = new AbortController();
        var rt = setTimeout(() => rc.abort(), timeout);
        var redirectedRes = await fetch(newUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: rc.signal
        });
        clearTimeout(rt);
        if (redirectedRes.ok) {
          var text = await redirectedRes.text();
          results.push({ url: newUrl, text: text, redirected: true });
        }
      }
    }
  } catch (e) { }

  try {
    var controller = new AbortController();
    var timeoutId = setTimeout(() => controller.abort(), timeout);
    var res = await fetch(urlhttp, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'manual',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.status === 200) {
      var text = await res.text();
      results.push({ url: urlhttp, text: text, redirected: false });
    } else if ([301, 302, 303, 307, 308].indexOf(res.status) !== -1) {
      var location = res.headers.get('location');
      if (location) {
        var newUrl = new URL(location, urlhttp).href;
        var rc = new AbortController();
        var rt = setTimeout(() => rc.abort(), timeout);
        var redirectedRes = await fetch(newUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: rc.signal
        });
        clearTimeout(rt);
        if (redirectedRes.ok) {
          var text = await redirectedRes.text();
          results.push({ url: newUrl, text: text, redirected: true });
        }
      }
    }
  } catch (e) { }
  
  if (results.length === 0) {
    throw new Error('Failed to fetch from both http and https');
  }
  results.sort(function(a, b) { return b.text.length - a.text.length; });
  return results[0];
}

async function handleConvert(request) {
  var ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  var limit = checkLimit(ip);
  var headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (!limit.ok) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Free: 10/min. Retry in ' + limit.retry + 's' }), { status: 429, headers: headers });
  }
  try {
    var body = await request.json();
    var url = body.url;
    var parsed = parseUrlInput(url);
    if (!parsed) {
      return new Response(JSON.stringify({ error: 'Invalid URL: ' + url }), { status: 400, headers: headers });
    }
    var result = await fetchWithBestProtocol(parsed.href);
    var html = result.text;
    var md = cleanMd(htmlToMd(html));
    return new Response(JSON.stringify({ url: result.url, title: getTitle(html), markdown: md, length: md.length, redirected: result.redirected }), { headers: headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: headers });
  }
}

async function handleConvertURL(url) {
  var key = 'url-' + url.slice(0, 30);
  var limit = checkLimit(key);
  var headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (!limit.ok) {
    return new Response(JSON.stringify({ error: 'Rate limit. Try again later.' }), { status: 429, headers: headers });
  }
  try {
    var parsed = parseUrlInput(url);
    if (!parsed) {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400, headers: headers });
    }
    var result = await fetchWithBestProtocol(parsed.href);
    var html = result.text;
    var md = cleanMd(htmlToMd(html));
    return new Response(JSON.stringify({ url: result.url, title: getTitle(html), markdown: md, length: md.length, redirected: result.redirected }), { headers: headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: headers });
  }
}
