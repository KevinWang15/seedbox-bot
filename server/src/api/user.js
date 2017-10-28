import express from 'express';
import { AuthMiddleware } from "../middleware/auth";
import { User } from "../models/index";

const router = express.Router();

router.use(AuthMiddleware);

router.post('/info', async function (req, res) {
  res.send({});
});

module.exports = router;