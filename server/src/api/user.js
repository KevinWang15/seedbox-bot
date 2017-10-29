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
          name: _.name,
          url: _.url,
          max_size_mb: _.max_size_mb,
        })),
      }
    })),
  });
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