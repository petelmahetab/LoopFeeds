import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

import app from './src/app.js';
import connectDB from './src/db/db.js';

connectDB();


const keyPath = path.join('./certs', 'localhost+2-key.pem');
const certPath = path.join('./certs', 'localhost+2.pem');

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const HTTPS_PORT = process.env.HTTPS_PORT || 3001;
const HTTP_PORT = process.env.PORT || 3000;

https.createServer(options, app).listen(HTTPS_PORT, () => {
  console.log(`✅ HTTPS Server running at https://localhost:${HTTPS_PORT}`);
});


http.createServer((req, res) => {
  res.writeHead(301, {
    "Location": `https://localhost:${HTTPS_PORT}${req.url}`
  });
  res.end();
}).listen(HTTP_PORT, () => {
  console.log(`🔄 HTTP Server redirecting to HTTPS on port ${HTTP_PORT}`);
});
