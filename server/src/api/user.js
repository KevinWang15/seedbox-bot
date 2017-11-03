import express from 'express';
import { AuthMiddleware } from "../middleware/auth";
import { User, BoxConfig, RssFeed, RssFeedTorrent } from "../models/index";

const router = express.Router();

router.use(AuthMiddleware);

router.post('/info', async function (req, res) {
  res.send({});
});

router.post('/box-list', async function (req, res) {
  let boxConfigs = await BoxConfig.findAll({
    where: {
      user_id: req.user.id,
    },
  });

  res.send({
    list: await Promise.all(boxConfigs.map(async (boxConfig) => {
      let rssFeeds = await RssFeed.findAll({
        where: {
          box_id: boxConfig.id,
        },
      });
      return {
        id: boxConfig.id,
        url: boxConfig.url,
        client_type: boxConfig.client_type,
        max_disk_usage_size_gb: boxConfig.max_disk_usage_size_gb,
        basic_auth_username: boxConfig.basic_auth_username,
        basic_auth_password: boxConfig.basic_auth_password,
        username: boxConfig.username,
        password: boxConfig.password,
        rss_feeds: rssFeeds.map(_ => ({
          id: _.id,
          name: _.name,
          url: _.url,
          max_size_mb: _.max_size_mb,
          max_share_ratio: _.max_share_ratio,
        })),
      }
    })),
  });
});

router.post('/edit-box', async function (req, res) {
  let boxConfig = await BoxConfig.find({
    where: {
      id: req.body.id,
    },
  });

  if (!boxConfig || boxConfig.user_id !== req.user.id) {
    res.send(400, {
      errMsg: "错误的ID",
    });
    return;
  }

  let newData = {};
  ['url', 'client_type', 'max_disk_usage_size_gb', 'basic_auth_username', 'basic_auth_password', 'username', 'password'].forEach(_ => {
    newData[_] = req.body[_];
  });
  await boxConfig.update(newData);

  let oldRssFeeds = await RssFeed.findAll({
    where: {
      box_id: boxConfig.id,
    },
  });
  let newRssFeeds = req.body.rss_feeds;
  let newRssFeedIds = newRssFeeds.map(_ => _.id);
  let oldRssFeedIds = oldRssFeeds.map(_ => _.id);

  let rssFeedsToAdd = newRssFeeds.filter(_ => !_.id);
  let rssFeedsToDelete = oldRssFeeds.filter(_ => newRssFeedIds.indexOf(_.id) < 0);
  let rssFeedsToUpdate = newRssFeeds.filter(_ => oldRssFeedIds.indexOf(_.id) >= 0);

  // console.log("rssFeedsToAdd", rssFeedsToAdd, "rssFeedsToDelete", rssFeedsToDelete, "rssFeedsToUpdate", rssFeedsToUpdate);

  rssFeedsToAdd.forEach(async (_) => {
    await RssFeed.create({
      box_id: boxConfig.id,
      name: _.name,
      url: _.url,
      max_size_mb: _.max_size_mb,
      max_share_ratio: _.max_share_ratio,
    });
  });

  rssFeedsToDelete.forEach(async (_) => {
    let originalFeed = await RssFeed.find({ where: { id: _.id } });
    if (originalFeed && originalFeed.box_id === boxConfig.id) {
      await originalFeed.destroy();
    }
  });

  rssFeedsToUpdate.forEach(async (_) => {
    let originalFeed = await RssFeed.find({ where: { id: _.id } });
    if (originalFeed && originalFeed.box_id === boxConfig.id) {
      await originalFeed.update({
        id: _.id,
        name: _.name,
        url: _.url,
        max_size_mb: _.max_size_mb,
        max_share_ratio: _.max_share_ratio,
      });
    }
  });

  res.send({});
});

router.post('/delete-box', async function (req, res) {

  let boxConfig = await BoxConfig.find({
    where: {
      id: req.body.id,
    },
  });

  if (!boxConfig || boxConfig.user_id !== req.user.id) {
    res.send(400, {
      errMsg: "错误的ID",
    });
    return;
  }

  let rssFeeds = await RssFeed.findAll({
    where: {
      box_id: boxConfig.id,
    },
  });

  rssFeeds.forEach(async rssFeed => {
    await RssFeedTorrent.destroy({
      where: {
        rss_feed_id: rssFeed.id,
      },
    });
  });

  await RssFeed.destroy({
    where: {
      box_id: boxConfig.id,
    },
  });

  await boxConfig.destroy();

  res.send({});
});


router.post('/create-box', async function (req, res) {

  let boxConfig = await BoxConfig.create({
    user_id: req.user.id,
  });

  res.send({ id: boxConfig.id });
});

module.exports = router;