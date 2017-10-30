import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";
import { User } from './User';

const BoxConfig = sequelize.define('box_config', {
  user_id: Sequelize.INTEGER,
  url: Sequelize.STRING,
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  basic_auth_username: Sequelize.STRING,
  basic_auth_password: Sequelize.STRING,
  client_type: Sequelize.INTEGER, /* ClientTypes */
  max_disk_usage_size_gb: Sequelize.INTEGER,
  autodel_exempt_label: Sequelize.STRING,
});

export { BoxConfig };