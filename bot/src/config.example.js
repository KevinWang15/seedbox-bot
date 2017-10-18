const mysql = {
  host: "127.0.0.1",
  database: "qbbot",
  username: "root",
  password: "",
};

const server = {
  port: 10120,
};

const http = {
  maxConcurrency: 8,
};

export {
  server,
  mysql,
  http,
};
