import statusCodes from 'status-codes';

export function createError(statusCode, message) {
    return {
        isHttpError: true,
        statusName: statusCodes[statusCode].name,
        statusCode,
        message
    }
}

export function errorsMiddleware(err, req, res, next) {
    if (err.isHttpError) {
        res.status(err.statusCode).send(`[${err.statusCode} ${err.statusName}: ${err.message}]`);
    }
}