import { User } from "../models/User";

function AuthMiddleware(req, res, next) {
  User.findAll({
    where: {
      token: req.get('token'),
    },
  }).then(users => {
    req.user = users[0];
    if (!req.user) {
      res.send(401, {
        errMsg: "Invalid token",
      });
    } else {
      next();
    }
  });
}

export { AuthMiddleware };