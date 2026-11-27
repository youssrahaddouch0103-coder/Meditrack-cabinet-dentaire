const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', require('./routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
