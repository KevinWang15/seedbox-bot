import path from "path";

const sqlite = {
  path: path.join(__dirname, '../database.sqlite'),
};

const server = {
  port: 10120,
};

const http = {
  maxConcurrency: 8,
  retryCount: 3,
};

exports.server = server;
exports.sqlite = sqlite;
exports.http = http;