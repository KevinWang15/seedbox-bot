import { User } from "../models/index";
import { sequelize } from "../databaseConnection";
import uuid from 'uuid/v1';

sequelize.sync()
  .then(() => {
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(User.create({
        token: uuid(),
      }))
    }
    Promise.all(promises).then(() => {
      process.exit();
    });
  });

