#!/usr/bin/env node

import { BoxConfig, RssFeed, User } from '../models/index'
import { sequelize } from '../databaseConnection'

sequelize.sync().then(() => {
  Promise.all([BoxConfig.findAll(), User.findAll(), RssFeed.findAll()]).
    then(results => {
      const [BoxConfig, User, RssFeed] = results
      console.log(Buffer.from(JSON.stringify({
          BoxConfig,
          User,
          RssFeed,
        })).toString('base64'),
      )
    })
})
