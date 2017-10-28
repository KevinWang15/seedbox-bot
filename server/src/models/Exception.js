import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";

const Exception = sequelize.define('exception', {
  user_id: Sequelize.INTEGER,
  ref_id: Sequelize.INTEGER,
  exception: Sequelize.STRING,
  source: Sequelize.STRING,
});

export { Exception };