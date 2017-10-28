import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";
import { User } from './User';

const ClientTypes = {
  qBittorrent: 0,
  Transmission: 1,
  ruTorrent: 2,
};

const BoxConfig = sequelize.define('box_config', {
  user_id: Sequelize.INTEGER,
  url: Sequelize.STRING,
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  basic_auth_username: Sequelize.STRING,
  basic_auth_password: Sequelize.STRING,
  rss_enabled: Sequelize.INTEGER,
  rss_interval: Sequelize.INTEGER,
  auto_del_enabled: Sequelize.INTEGER,
  auto_del_interval: Sequelize.INTEGER,
  client_type: Sequelize.INTEGER, /* ClientTypes */
});

BoxConfig.belongsTo(User, { foreignKey: 'user_id' });
export { BoxConfig, ClientTypes };