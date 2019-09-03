import 'babel-polyfill';
import http from 'http';
import https from 'https';
import express from 'express';
import fs from 'fs';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import config from './config';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import facebook from './facebook';
import kakao from './kakao';

let app = express();
app.server = http.createServer(app);

try {
  const CREDENTIAL_PATH = process.env.CREDENTIAL_PATH || '/etc/letsencrypt/live/swmlegato.tk/';
  const credentials = {
    key: fs.readFileSync(CREDENTIAL_PATH + 'privkey.pem', 'utf8'),
    cert: fs.readFileSync(CREDENTIAL_PATH + 'cert.pem', 'utf8'),
    ca: fs.readFileSync(CREDENTIAL_PATH + 'chain.pem', 'utf8'),
  };
  app.secureServer = https.createServer(credentials, app);
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log("SSL Certificicate doesn't exist. Only HTTP server is running.");
  } else throw err;
}

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	// chatbot platform
  app.use('/facebook', facebook({ config, db }));
  app.use('/kakao', kakao());

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
  });
  
  if (app.secureServer) {
    app.secureServer.listen(443);
  }
});

export default app;
