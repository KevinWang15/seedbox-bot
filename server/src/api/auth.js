import express from 'express';
import * as bcrypt from "bcrypt-nodejs";
import uuid from 'uuid/v1';

import { AuthMiddleware } from '../middleware/auth';
import { User } from "../models/index";
const router = express.Router();

// router.use(AuthMiddleware);

router.post('/login', async function (req, res) {
  const username = req.body.username, password = req.body.password;

  if (!username || !password) {
    res.send(400, {
      errMsg: "",
    });
    return;
  }

  let user = await User.find(
    {
      where: { username },
    },
  );

  if (!user) {
    res.send(401, {
      errMsg: "用户不存在",
    });
  }

  bcrypt.compare(password, user.password || "", async (err, compareResult) => {
    if (err || !compareResult) {
      res.send(401, {
        errMsg: "密码错误",
      });
      return;
    }

    let token = uuid();
    await user.update({
      token,
    });

    res.send({ token });
  });
});

module.exports = router;