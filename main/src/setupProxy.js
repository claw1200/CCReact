const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/Travel',
    createProxyMiddleware({
      target: 'https://media.carecontrolsystems.co.uk',
      changeOrigin: true,
      secure: true,
      headers: {
        'Accept': 'text/plain',
      },
      onProxyRes: function(proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      },
    })
  );
}; 