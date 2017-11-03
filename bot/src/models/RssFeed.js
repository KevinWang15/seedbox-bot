import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";
import { BoxConfig } from './BoxConfig';

const RssFeed = sequelize.define('rss_feed', {
  box_id: Sequelize.INTEGER,
  name: Sequelize.STRING,
  url: Sequelize.STRING,
  filter: Sequelize.STRING,
  label: Sequelize.STRING,
  max_size_mb: Sequelize.INTEGER,
  max_share_ratio: Sequelize.DECIMAL(10, 2),
});

export { RssFeed };