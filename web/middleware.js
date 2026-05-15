const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (req, res, next) {
  if (req.url.startsWith('/api/analyze')) {
    return createProxyMiddleware({
      target: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: { '^/api/analyze': '/analyze' },
    })(req, res, next);
  }
  next();
};
