/**
 * Orbital Loader - Minimalist Production Server
 * 
 * Can run with Express or Node's native HTTP module.
 * Serves static files with CORS enabled (Access-Control-Allow-Origin: *)
 * so your orbital-loader.js can be embedded into ANY external webpage or app.
 * 
 * Usage:
 *   node server.js
 *   or
 *   npm start
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// MIME types for web assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  // 1. Enable full CORS for cross-origin script embedding
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 2. Parse URL path safely
  let safePath = req.url.split('?')[0];
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security: prevent path traversal outside root
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${safePath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Cache control: cache JS for 1 hour, or revalidate in dev
    res.setHeader('Content-Type', contentType);
    if (ext === '.js') {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  Minimalist Orbital Loader Component Server`);
  console.log(`  Local Preview:  http://localhost:${PORT}`);
  console.log(`  Component URL:  http://localhost:${PORT}/orbital-loader.js`);
  console.log(`  CORS:           Enabled (Embeddable on any site)`);
  console.log(`======================================================\n`);
});

// Optional: If you prefer standard Express syntax, you can also use:
/*
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
*/
