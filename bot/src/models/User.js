import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";

const User = sequelize.define('user', {
  token: Sequelize.STRING,
  enabled: Sequelize.INTEGER,
});

export { User };