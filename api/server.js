import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Import your API handlers
import listingsHandler from './api/listings.js';
import propertyHandler from './api/property/[id].js';

// Convert your Vercel-style handlers to Express middleware
const adaptVercelHandler = (handler) => {
  return async (req, res) => {
    const vercelReq = {
      method: req.method,
      query: req.query,
      params: req.params,
      headers: req.headers,
      body: req.body
    };
    
    const vercelRes = {
      statusCode: 200,
      _headers: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this._data = data;
        return this;
      },
      end() {
        return this;
      },
      setHeader(key, value) {
        this._headers[key] = value;
        res.setHeader(key, value);
      }
    };
    
    try {
      await handler(vercelReq, vercelRes);
      
      // Apply headers
      Object.entries(vercelRes._headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      // Send response
      if (vercelRes._data) {
        res.status(vercelRes.statusCode).json(vercelRes._data);
      } else {
        res.status(vercelRes.statusCode).end();
      }
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// API Routes
app.get('/api/listings', adaptVercelHandler(listingsHandler));
app.get('/api/property/:id', (req, res) => {
  // Adapt the handler for Express
  const handler = async (vercelReq, vercelRes) => {
    vercelReq.query = { id: req.params.id };
    return await propertyHandler(vercelReq, vercelRes);
  };
  
  adaptVercelHandler(handler)(req, res);
});

// Serve HTML pages with routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/property/:id', (req, res) => {
  // For pretty URLs: /property/123
  res.sendFile(path.join(__dirname, 'property.html'));
});

app.get('/property.html', (req, res) => {
  // For direct access: /property.html?id=123
  res.sendFile(path.join(__dirname, 'property.html'));
});

// Handle 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Static files from: ${__dirname}`);
  console.log(`🌐 Homepage: http://localhost:${PORT}`);
  console.log(`🔧 API endpoints:`);
  console.log(`   GET http://localhost:${PORT}/api/listings`);
  console.log(`   GET http://localhost:${PORT}/api/property/:id`);
});
