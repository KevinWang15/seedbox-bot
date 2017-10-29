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
    list: boxConfigs.map(_ => ({
      id: _.id,
      url: _.url,
      client_type: _.client_type,
      max_disk_usage_size_gb: _.max_disk_usage_size_gb,
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

module.exports = router;