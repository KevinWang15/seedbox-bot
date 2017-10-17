import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";
import { User } from './User';

const RssFeed = sequelize.define('rss_feed', {
  user_id: Sequelize.INTEGER,
  name: Sequelize.STRING,
  url: Sequelize.STRING,
  filter: Sequelize.STRING,
  label: Sequelize.STRING,
  max_size_mb: Sequelize.INTEGER,
});

RssFeed.belongsTo(User, { foreignKey: 'user_id' });

export { RssFeed };