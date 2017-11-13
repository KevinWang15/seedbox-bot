const sqlite = {
  path: '/absolute/path/to/database.sqlite',
};

const server = {
  port: 10120,
};

const proxy = {
  enabled: false,
  host: "127.0.0.1",
  port: 1080,
  username: "",
  password: "",
};

const http = {
  maxConcurrency: 8,
  retryCount: 3,
};

const userTask = {
  interval: 20,
};

const system = {
  newUserScanInterval: 60,
  newTorrentsTTL: 180,
  retryFailedTorrentsAfter: 60,
};

exports.userTask = userTask;
exports.server = server;
exports.sqlite = sqlite;
exports.http = http;
exports.system = system;
exports.proxy = proxy;