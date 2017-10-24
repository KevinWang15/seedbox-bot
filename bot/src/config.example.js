const mysql = {
  host: "127.0.0.1",
  database: "qbbot",
  username: "root",
  password: "",
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
  interval: 120,
};

const system = {
  newUserScanInterval: 60,
  newTorrentsTTL: 180,
};

export {
  userTask,
  server,
  mysql,
  http,
  system,
  proxy,
};
