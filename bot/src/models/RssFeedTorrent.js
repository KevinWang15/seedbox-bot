import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";
import { RssFeed } from './RssFeed';

const RssFeedTorrent = sequelize.define('rss_feed_torrent', {
  rss_feed_id: Sequelize.INTEGER,
  torrent_path: Sequelize.STRING,
  status: Sequelize.INTEGER,
  file_size_kb: Sequelize.INTEGER,
});

RssFeedTorrent.belongsTo(RssFeed, { foreignKey: 'rss_feed_id' });
export { RssFeedTorrent };