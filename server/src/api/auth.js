import express from 'express';
import { AuthMiddleware } from '../middleware/auth';
const router = express.Router();

// router.use(AuthMiddleware);

router.post('/login', function (req, res) {
  console.log(req);
  res.end("hello");
});

module.exports = router;