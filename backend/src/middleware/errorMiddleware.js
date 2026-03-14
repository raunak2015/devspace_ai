function notFoundHandler(req, res, next) {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
}

function errorHandler(err, _req, res, _next) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message || 'Internal server error'
    });
}

module.exports = {
    notFoundHandler,
    errorHandler
};
