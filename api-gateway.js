const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8080;

// Proxy requests to Auth Server
app.use('/auth', createProxyMiddleware({ target: 'http://localhost:4000', changeOrigin: true }));
// Proxy requests to Message Server
app.use('/messages', createProxyMiddleware({ target: 'http://localhost:4001', changeOrigin: true }));
// Proxy requests to Storage Server
app.use('/storage', createProxyMiddleware({ target: 'http://localhost:4002', changeOrigin: true }));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
