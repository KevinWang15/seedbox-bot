import path from "path";

const sqlite = {
  path: path.join(__dirname, '../database.sqlite'),
};

const server = {
  port: 10120,
};

exports.server = server;
exports.sqlite = sqlite;