import express from 'express';
import { AuthMiddleware } from '../middleware/auth';
const router = express.Router();

router.use(AuthMiddleware);

router.post('/', function (req, res) {
  if (req.user) {

  }
});

router.post('/info', function (req, res) {
  if (req.user) {

  }
});

module.exports = router;