function notFoundHandler(req, res, next) {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
}

function errorHandler(err, _req, res, _next) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    const payload = {
        message: err.message || 'Internal server error'
    };

    if (err.code) {
        payload.code = err.code;
    }

    if (typeof err.retryAfterSeconds === 'number') {
        payload.retryAfterSeconds = err.retryAfterSeconds;
    }

    res.status(statusCode).json(payload);
}

module.exports = {
    notFoundHandler,
    errorHandler
};
