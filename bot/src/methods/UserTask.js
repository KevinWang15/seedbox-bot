import { userTask as userTaskConfig } from '../config';
import { BoxConfig } from "../models/BoxConfig";
import { Exception } from "../models/Exception";
import { RssFeed } from "../models/RssFeed";
import { RssFeedTorrent, status as RssFeedTorrentStatus } from "../models/RssFeedTorrent";
import { FetchRssFeed } from "../methods/FetchRssFeed";
import { DownloadAndParseTorrent } from "../methods/DownloadAndParseTorrent";
import Sequelize from 'sequelize';
import { AddTorrent } from "./AddTorrent";
import { createClient } from "../clients/index";
import { CheckIfHasSpace } from "./CheckIfHasSpace";
import { FreeUpSpace } from "./FreeUpSpace";

const Op = Sequelize.Op;
class UserTask {
  user_id;
  interval_id;
  run_lock;
  clients = [];

  constructor(user_id) {
    this.user_id = user_id;
    this.run = this.run.bind(this);
  }

  start() {
    this.interval_id = setInterval(this.run, (userTaskConfig.interval || 120) * 1000);
    this.run();
  }

  logException(exception, source, ref_id) {
    console.warn("#! Exception", exception, source, ref_id);
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
    console.log("New user task..");
    try {
      let userBoxes = await this.getUserBoxes();
      let parallelTasks = [];
      for (let k = 0; k < userBoxes.length; k++) {
        parallelTasks.push((async (k) => {
          let boxConfig = userBoxes[k];
          try {
            if (!this.clients[boxConfig.id]
              || this.clients[boxConfig.id].boxConfig.url !== boxConfig.url
              || this.clients[boxConfig.id].boxConfig.username !== boxConfig.username
              || this.clients[boxConfig.id].boxConfig.password !== boxConfig.password
              || this.clients[boxConfig.id].boxConfig.basic_auth_username !== boxConfig.basic_auth_username
              || this.clients[boxConfig.id].boxConfig.basic_auth_password !== boxConfig.basic_auth_password
              || this.clients[boxConfig.id].boxConfig.client_type !== boxConfig.client_type
              || this.clients[boxConfig.id].boxConfig.max_disk_usage_size_gb !== boxConfig.max_disk_usage_size_gb
              || this.clients[boxConfig.id].boxConfig.autodel_exempt_label !== boxConfig.autodel_exempt_label
            ) {
              console.log("Creating new client..");
              this.clients[boxConfig.id] = createClient(boxConfig);
            }

            if (!boxConfig.rssFeeds.length) {
              console.log("No rss feeds.. just free up space");
              let spaceData = await CheckIfHasSpace(this.clients[boxConfig.id], 0);
              if (!spaceData.hasSpace) {
                await FreeUpSpace(this.clients[boxConfig.id], spaceData.filesList, spaceData.spaceToFreeUp);
              }
            }

            // 从远处fetch rss feed
            let allRssFeeds = (await Promise.all(boxConfig.rssFeeds.map(FetchRssFeed)));
            for (let j = 0; j < allRssFeeds.length; j++) {
              try {
                // 每一个rss源设置一个循环
                let existingUrls = boxConfig.rssFeeds[j].rssFeedTorrents.map(_ => _.url);
                let currentRssFeed = allRssFeeds[j];
                let currentRssFeedTorrentUrls = currentRssFeed.torrents.map(_ => _.url);
                let rssFeedTorrents = currentRssFeed.torrents.filter(_ => existingUrls.indexOf(_.url) < 0);
                let expiredUrls = existingUrls.filter(_ => currentRssFeedTorrentUrls.indexOf(_) < 0);
                await RssFeedTorrent.destroy({
                  where: {
                    rss_feed_id: boxConfig.rssFeeds[j].id,
                    url: {
                      [Op.in]: expiredUrls,
                    },
                  },
                });
                for (let i = 0; i < rssFeedTorrents.length; i++) {
                  try {
                    let rssFeedTorrent = await RssFeedTorrent.create({
                      rss_feed_id: rssFeedTorrents[i].rss_feed_id,
                      status: RssFeedTorrentStatus.PENDING_DOWNLOAD,
                      url: rssFeedTorrents[i].url,
                      title: rssFeedTorrents[i].title,
                      pub_date: Date.parse(rssFeedTorrents[i].pubDate) || (+new Date()),
                    });
                    rssFeedTorrents[i].id = rssFeedTorrent.id; // 异常处理的时候reference使用
                    let torrentData = (await DownloadAndParseTorrent(rssFeedTorrents[i].url));

                    if (!currentRssFeed.max_size_mb || (currentRssFeed.max_size_mb * 1024 * 1024 > torrentData.length)) {
                      // 种子文件合适，正在添加
                      await rssFeedTorrent.update({
                        status: RssFeedTorrentStatus.PENDING_ADD,
                        file_size_kb: torrentData.length / 1024,
                      });
                      await AddTorrent(this.clients[boxConfig.id], rssFeedTorrent, torrentData);
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
                this.logException(rssFeedError.toString() + "\n\n\n" + rssFeedError.stack, "rssFeedError", allRssFeeds[j].id);
              }
            }
          } catch (boxError) {
            this.logException(boxError.toString() + "\n\n\n" + boxError.stack, "boxError", boxConfig.id);
          }
        })(k));
      }
      await Promise.all(parallelTasks);
    } catch (exception) {
      this.logException(exception.toString() + "\n\n\n" + exception.stack, "run", this.user_id);
    }
    this.run_lock = false;
  }


  async getUserBoxes() {
    let boxConfigs = await BoxConfig.findAll({
      where: {
        user_id: this.user_id,
      },
    });
    let rssFeeds = await RssFeed.findAll({
      where: {
        box_id: {
          [Op.in]: boxConfigs.map(_ => _.id),
        },
      },
    }).filter(_ => !!_.url);
    let rssFeedTorrents = await RssFeedTorrent.findAll({
      where: {
        rss_feed_id: {
          [Op.in]: rssFeeds.map(_ => _.id),
        },
      },
    });
    boxConfigs.forEach(boxConfig => {
      boxConfig.rssFeeds = rssFeeds.filter(_ => _.box_id === boxConfig.id);
    });
    rssFeeds.forEach(rssFeed => {
      rssFeed.rssFeedTorrents = rssFeedTorrents.filter(_ => _.rss_feed_id === rssFeed.id);
    });
    return boxConfigs;
  }
}

export { UserTask };