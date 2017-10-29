import express from 'express';
import { AuthMiddleware } from "../middleware/auth";
import { User, BoxConfig } from "../models/index";

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

module.exports = router;