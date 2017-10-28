import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  token: Sequelize.STRING,
});

export { User };