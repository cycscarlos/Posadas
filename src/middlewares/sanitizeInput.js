const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    for (const key in req.body) {
      if (Object.prototype.hasOwnProperty.call(req.body, key) && typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<[^>]*>/g, '').trim();
      }
    }
  }
  next();
};

module.exports = sanitizeInput;
