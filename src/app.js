import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import recursiveReaddirSync from 'recursive-readdir-sync';

import { errorsMiddleware, notFoundMiddleware } from '#src/middlewares';

// this is fucking stupid, thanks ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// set content type for all responses
app.use((req, res, next) => {
    res.type('text/plain');

    next();
});

// dynamically load all routes in the directory
const routesDir = path.join(__dirname, 'routes');
const routeFiles = recursiveReaddirSync(routesDir).filter(file => file.endsWith('.route.js'));

// do NOT use async forEach, otherwise it'll mess up the order of middlewares due to awaiting for dynamic imports
for (const file of routeFiles) {
    const { default: router } = await import(file);
    let basePath = `/${path.relative(routesDir, file)}`;

    basePath = basePath.substring(0, basePath.lastIndexOf('.route.js'));

    app.use(basePath, router);
}

app.use(errorsMiddleware);
app.use(notFoundMiddleware);

export default app;