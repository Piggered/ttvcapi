import { matchedData, validationResult } from 'express-validator';

import { getKeyStatus, hasAccess, KeyStatus } from '#src/authorization';
import { createError } from '#src/errors';

export function authorizationMiddleware(req, res, next) {
    const key = req.query.key;
    const endpoint = req.baseUrl + req.route.path;

    if (getKeyStatus(key) === KeyStatus.Invalid) {
        return next(createError(401, 'invalid provided API key'));
    }

    if (!hasAccess(key, endpoint)) {
        return next(createError(403, 'no permission to access this endpoint'));
    }

    return next();
}

export function errorsMiddleware(err, req, res, next) {
    if (err.isHttpError) {
        res.status(err.statusCode).send(`[${err.statusCode} ${err.statusName}: ${err.message}]`);
    }
}

export function notFoundMiddleware(req, res, next) {
    const err = createError(404, 'endpoint does not exist');

    res.status(err.statusCode).send(`[${err.statusCode} ${err.statusName}: ${err.message}]`);
}

export function validationMiddleware(req, res, next) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        req.matchedData = matchedData(req);

        return next();
    }

    const message = errors.array().map(error => error.msg).join(', ');

    return next(createError(400, message));
}