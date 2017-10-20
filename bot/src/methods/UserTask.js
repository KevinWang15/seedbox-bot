import { userTask as userTaskConfig } from '../config';
import { BoxConfig } from "../models/BoxConfig";
import { Exception } from "../models/Exception";
import { AutoDelConfig } from "../models/AutoDelConfig";
import { RssFeed } from "../models/RssFeed";
import { RssFeedTorrent, status as RssFeedTorrentStatus } from "../models/RssFeedTorrent";
import { FetchRssFeed } from "../methods/FetchRssFeed";
import { DownloadAndParseTorrent } from "../methods/DownloadAndParseTorrent";
import Sequelize from 'sequelize';
import { AddTorrentToQb } from "./AddTorrentToQb";

const Op = Sequelize.Op;
class UserTask {
  user_id;
  interval_id;
  run_lock;

  constructor(user_id) {
    this.user_id = user_id;
    this.run = this.run.bind(this);
  }

  start() {
    this.interval_id = setInterval(this.run, (userTaskConfig.interval || 120) * 1000);
    this.run();
  }

  logException(exception, source, ref_id) {
    Exception.create({
      ref_id,
      source,
      exception,
      user_id: this.user_id,
    });
  }

  async run() {
    if (this.run_lock)
      return;
    this.run_lock = true;

    try {
      let userConfig = await this.getUserConfig();
      // 从远处fetch rss feed
      let existingUrls = userConfig.rssFeedTorrents.map(_ => _.url);
      let allRssFeeds = (await Promise.all(userConfig.rssFeeds.map(FetchRssFeed)));
      for (let k = 0; k < allRssFeeds.length; k++) {
        try {
          // 每一个rss源设置一个循环
          let currentRssFeed = allRssFeeds[k];
          let rssFeedTorrents = currentRssFeed.torrents.filter(_ => existingUrls.indexOf(_.url) < 0);
          for (let i = 0; i < rssFeedTorrents.length; i++) {
            try {
              let rssFeedTorrentItem = rssFeedTorrents[i];
              let rssFeedTorrent = await RssFeedTorrent.create({
                rss_feed_id: rssFeedTorrentItem.rss_feed_id,
                status: RssFeedTorrentStatus.PENDING_DOWNLOAD,
                url: rssFeedTorrentItem.url,
                title: rssFeedTorrentItem.title,
                pub_date: Date.parse(rssFeedTorrentItem.pubDate),
              });
              rssFeedTorrentItem.id = rssFeedTorrent.id; // 异常处理的时候reference使用
              let torrentData = (await DownloadAndParseTorrent(rssFeedTorrentItem.url));

              if (currentRssFeed.max_size_mb * 1024 * 1024 > torrentData.length) {
                // 种子文件合适，正在添加
                await rssFeedTorrent.update({
                  status: RssFeedTorrentStatus.PENDING_ADD,
                  file_size_kb: torrentData.length / 1024,
                });
                let addResult = await AddTorrentToQb(userConfig.boxConfig, rssFeedTorrentItem.url);
                if (addResult) {
                  rssFeedTorrent.update({
                    status: RssFeedTorrentStatus.ADDED,
                    file_size_kb: torrentData.length / 1024,
                  });
                } else {
                  rssFeedTorrent.update({
                    status: RssFeedTorrentStatus.ADD_FAILED,
                    file_size_kb: torrentData.length / 1024,
                  });
                }
              } else {
                // 种子文件太大
                await rssFeedTorrent.update({
                  status: RssFeedTorrentStatus.FILTERED_OUT,
                  file_size_kb: torrentData.length / 1024,
                });
              }
            } catch (feedTorrentError) {
              this.logException(feedTorrentError.toString() + "\n\n\n" + feedTorrentError.stack, "feedTorrentError", rssFeedTorrents[i].id);
            }
          }
        } catch (rssFeedError) {
          this.logException(rssFeedError.toString() + "\n\n\n" + rssFeedError.stack, "rssFeedError", allRssFeeds[k].id);
        }
      }
    } catch (exception) {
      this.logException(exception.toString() + "\n\n\n" + exception.stack, "run", this.user_id);
    }
    this.run_lock = false;
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