import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";
import { User } from './User';

const Log = sequelize.define('log', {
  user_id: Sequelize.INTEGER,
  type: Sequelize.INTEGER,
  content: Sequelize.STRING,
});

export { Log };