function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';
  console.error(err);
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
