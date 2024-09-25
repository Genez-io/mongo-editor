import serverless from "serverless-http";
import express from 'express';
import bodyParser from 'body-parser';

import DataBase from './src/db/dataAccessAdapter.js';
import router from './src/routes/database.js';

// initialize app
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json({ limit: process.env.BODY_SIZE || '50mb' }));

// api routing
app.use('/databases', router);

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  const error = {
    errmsg: err.errmsg,
    name: err.name,
  };
  return res.status(500).send(error);
});

export const handler = serverless(app);

