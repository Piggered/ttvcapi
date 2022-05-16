import 'dotenv/config';

import axios from 'axios';

import app from './app.js';

const { PORT } = process.env;

// allow receiving non 2xx responses without throwing an error
axios.defaults.validateStatus = status => status >= 200;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});