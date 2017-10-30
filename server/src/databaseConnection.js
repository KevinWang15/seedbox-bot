import { sqlite } from "./config";
import Sequelize from 'sequelize';

const sequelize = new Sequelize(sqlite.database, sqlite.username, sqlite.password,
  {
    host: sqlite.host,
    dialect: 'sqlite',
    logging: false,
    storage: sqlite.path,
  });

export { sequelize };