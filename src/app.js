import express from 'express';

import { errorsMiddleware } from './errors.js';

import steam from './routes/steam.js';

const app = express();

app.use((req, res, next) => {
    res.type('text/plain');

    next();
});

app.use('/steam', steam);

app.use('*', errorsMiddleware);

export default app;