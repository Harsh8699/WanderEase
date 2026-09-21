const csrfProtection = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || !req.cookies?.wanderease_token) {
    return next();
  }

  const requestOrigin = req.get('origin');
  const requestReferer = req.get('referer');
  let source = requestOrigin;
  if (!source && requestReferer) {
    try {
      source = new URL(requestReferer).origin;
    } catch {
      return res.status(403).json({ message: 'Request origin is not allowed.' });
    }
  }
  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['http://localhost:8080'];

  if (!source || !allowedOrigins.includes(source)) {
    return res.status(403).json({ message: 'Request origin is not allowed.' });
  }

  return next();
};

module.exports = { csrfProtection };