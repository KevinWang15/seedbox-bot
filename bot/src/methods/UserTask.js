import { userTask as userTaskConfig } from '../config';
import { BoxConfig } from "../models/BoxConfig";
import { AutoDelConfig } from "../models/AutoDelConfig";
import { RssFeed } from "../models/RssFeed";
import { RssFeedTorrent } from "../models/RssFeedTorrent";
import Sequelize from 'sequelize';

const Op = Sequelize.Op;

class UserTask {
  user_id;
  interval_id;

  constructor(user_id) {
    this.user_id = user_id;
  }

  start() {
    this.interval_id = setInterval(this.run, (userTaskConfig.interval || 120) * 1000);
    this.run();
  }

  async run() {
    try {
      console.log("running user task", this.user_id);
      let userConfig = await this.getUserConfig();

    } catch (exception) {
      die(exception);
    }
  }

  die(exception) {
    //TODO: log exception, restart task
    console.warn("User Task terminated with error", exception);
  }

  async getUserConfig() {
    let boxConfig = await BoxConfig.find({
      where: {
        user_id: this.user_id,
      },
    });
    let autoDelConfig = await AutoDelConfig.find({
      where: {
        user_id: this.user_id,
      },
    });
    let rssFeeds = await RssFeed.findAll({
      where: {
        user_id: this.user_id,
      },
    });
    let rssFeedTorrents = await RssFeedTorrent.findAll({
      where: {
        rss_feed_id: {
          [Op.in]: rssFeeds.map(_ => _.id),
        },
      },
    });
    return { boxConfig, autoDelConfig, rssFeeds, rssFeedTorrents };
  }
}

export { UserTask };