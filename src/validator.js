import { matchedData, validationResult } from 'express-validator';

import { createError } from './errors.js';

export default (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        req.matchedData = matchedData(req);

        return next();
    }

    const message = errors.array().map(error => error.msg).join(', ');

    return next(createError(400, message));
};