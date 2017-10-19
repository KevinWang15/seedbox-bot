import { userTask as userTaskConfig } from '../config';
import { BoxConfig } from "../models/BoxConfig";
import { AutoDelConfig } from "../models/AutoDelConfig";
import { RssFeed } from "../models/RssFeed";
import { RssFeedTorrent, status as RssFeedTorrentStatus } from "../models/RssFeedTorrent";
import { FetchRssFeed } from "../methods/FetchRssFeed";
import { DownloadAndParseTorrent } from "../methods/DownloadAndParseTorrent";
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
      let allRssFeeds = (await Promise.all(userConfig.rssFeeds.map(FetchRssFeed)));
      for (let k = 0; k < allRssFeeds.length; k++) {
        // 每一个rss源设置一个循环
        let currentRssFeed = allRssFeeds[k];
        let rssFeedTorrents = currentRssFeed.torrents.filter(_ => existingUrls.indexOf(_.url) < 0);
        for (let i = 0; i < rssFeedTorrents.length; i++) {
          let rssFeedTorrentItem = rssFeedTorrents[i];
          let rssFeedTorrent = await RssFeedTorrent.create({
            rss_feed_id: rssFeedTorrentItem.rss_feed_id,
            status: RssFeedTorrentStatus.PENDING_DOWNLOAD,
            url: rssFeedTorrentItem.url,
            title: rssFeedTorrentItem.title,
            pub_date: Date.parse(rssFeedTorrentItem.pubDate), //FIXME: parse失败？
          });
          let torrentData = (await DownloadAndParseTorrent(rssFeedTorrentItem.url));

          if (currentRssFeed.max_size_mb * 1024 * 1024 > torrentData.length) {
            // 种子文件合适，正在添加
            await rssFeedTorrent.update({
              status: RssFeedTorrentStatus.PENDING_ADD,
              file_size_kb: torrentData.length / 1024,
            });
          } else {
            // 种子文件太大
            await rssFeedTorrent.update({
              status: RssFeedTorrentStatus.FILTERED_OUT,
              file_size_kb: torrentData.length / 1024,
            });
          }
        }
      }
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