import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";
import { RssFeed } from './RssFeed';

const status = {
  ADD_FAILED: -2,
  FILTERED_OUT: -1,
  PENDING_DOWNLOAD: 0,
  PENDING_ADD: 1,
  ADDED: 2,
};

const RssFeedTorrent = sequelize.define('rss_feed_torrent', {
  rss_feed_id: Sequelize.INTEGER,
  torrent_path: Sequelize.STRING,
  url: Sequelize.STRING,
  status: Sequelize.INTEGER,
  file_size_kb: Sequelize.INTEGER,
  title: Sequelize.STRING,
  pub_date:Sequelize.DATE
});

export { RssFeedTorrent, status };