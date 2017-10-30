import { sqlite } from "./config";
import Sequelize from 'sequelize';

const sequelize = new Sequelize(null, null, null,
  {
    dialect: 'sqlite',
    logging: false,
    storage: sqlite.path,
  });

export { sequelize };