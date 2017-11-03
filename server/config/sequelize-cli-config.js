const config = require("../src/config");
const fs = require('fs');
const sqlite = config.sqlite;

module.exports = {
  "development":  {
    dialect: 'sqlite',
    storage: sqlite.path,
  },
  "test": {
    dialect: 'sqlite',
    storage: sqlite.path,
  },
  "production": {
    dialect: 'sqlite',
    storage: sqlite.path,
  },
};
