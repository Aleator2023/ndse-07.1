function notFound(req, res, next) {
  res.status(404).json({ message: "Resource not found" });
}

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
}

module.exports = { notFound, errorHandler };
