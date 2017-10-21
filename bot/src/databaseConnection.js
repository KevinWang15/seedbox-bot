import { mysql } from "./config";
import Sequelize from 'sequelize';

const sequelize = new Sequelize(mysql.database, mysql.username, mysql.password,
  {
    host: mysql.host,
    dialect: 'mysql',
    logging: false,
  });

export { sequelize };