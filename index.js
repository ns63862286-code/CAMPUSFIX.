const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { PORT, UPLOADS_DIR } = require('./config');
const { initDatabase } = require('./db');
const { seedData } = require('./seed');
const { handleAuthRoutes } = require('./routes/authRoutes');
const { handleAiRoutes } = require('./routes/aiRoutes');
const { handleComplaintRoutes } = require('./routes/complaintRoutes');
const { handleAnalyticsRoutes } = require('./routes/analyticsRoutes');

// Initialize database schema and seed
initDatabase();
seedData();

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Access-Token');
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.searchParams;

  // Read request body if present
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk;
    // Protect against oversized payload (> 25MB)
    if (rawBody.length > 25 * 1024 * 1024) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Payload too large' }));
      req.destroy();
    }
  });

  req.on('end', () => {
    let body = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch (err) {
        // Leave body as string or empty
      }
    }

    // 1. API Routes
    if (pathname.startsWith('/api/auth')) {
      const handled = handleAuthRoutes(req, res, pathname, body);
      if (handled !== false) return;
    }

    if (pathname.startsWith('/api/ai')) {
      const handled = handleAiRoutes(req, res, pathname, body);
      if (handled !== false) return;
    }

    if (pathname.startsWith('/api/complaints')) {
      const handled = handleComplaintRoutes(req, res, pathname, query, body);
      if (handled !== false) return;
    }

    if (pathname.startsWith('/api/analytics')) {
      const handled = handleAnalyticsRoutes(req, res, pathname);
      if (handled !== false) return;
    }

    // 2. Health check route
    if (pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', service: 'CampusFix API', timestamp: new Date().toISOString() }));
    }

    // 3. Static File Serving from /public
    let relativePath = pathname === '/' ? '/index.html' : pathname;
    let safePath = path.normalize(path.join(PUBLIC_DIR, relativePath));

    // Security check to avoid path traversal
    if (!safePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Access Denied');
    }

    // If file exists, serve it
    if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      const stream = fs.createReadStream(safePath);
      return stream.pipe(res);
    }

    // Fallback: If not an API request, serve index.html for SPA routing
    if (!pathname.startsWith('/api/')) {
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        const stream = fs.createReadStream(indexPath);
        return stream.pipe(res);
      }
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint or resource not found', pathname }));
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` CampusFix Server is running on http://localhost:${PORT}`);
  console.log(` Environment: Node.js ${process.version}`);
  console.log(` Database: SQLite initialized`);
  console.log(`=======================================================`);
});
