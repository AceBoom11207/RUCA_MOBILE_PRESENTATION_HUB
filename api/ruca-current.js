// Preserve the old public entry point without a private-repository proxy.
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(307, '/demo/');
};
