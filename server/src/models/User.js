import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";

const User = sequelize.define('users', {
  token: Sequelize.STRING,
});

export { User };