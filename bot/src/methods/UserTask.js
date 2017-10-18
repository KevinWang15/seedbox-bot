import { userTask as userTaskConfig } from '../config';
import { BoxConfig } from "../models/BoxConfig";
import { AutoDelConfig } from "../models/AutoDelConfig";
import { RssFeed } from "../models/RssFeed";
import { RssFeedTorrent, status as RssFeedTorrentStatus } from "../models/RssFeedTorrent";
import { FetchRssFeed } from "../methods/FetchRssFeed";
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

      // 从远处fetch rss feed
      let existingUrls = userConfig.rssFeedTorrents.map(_ => _.url);
      let feedData = (await Promise.all(userConfig.rssFeeds.map(FetchRssFeed)))[0]; //TODO: why??
      console.log(feedData);
      let newFeedData = feedData.filter(_ => existingUrls.indexOf(_.url) < 0);
      newFeedData.forEach(newFeedDataItem => {
        // console.log(newFeedDataItem);
        RssFeedTorrent.create({
          rss_feed_id: newFeedDataItem.rss_feed_id,
          status: RssFeedTorrentStatus.PENDING_DOWNLOAD,
          url: newFeedDataItem.url,
          title: newFeedDataItem.title,
          pub_date: Date.parse(newFeedDataItem.pubDate), //FIXME: parse失败？
        });
      });
    } catch (exception) {
      this.die(exception);
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