#!/usr/bin/env node

import inquirer from 'inquirer'
import { BoxConfig, RssFeed, User } from '../models/index'
import { sequelize } from '../databaseConnection'

let prompt = inquirer.createPromptModule()

console.warn(
  '!!! WARNING: all existing configuration will be overwritten. Ctrl+C if you do not wish to continue.\n\n')

sequelize.sync().then(() => {
  prompt([
    {
      type: 'input',
      message: 'Paste data generated from export-config.js',
      name: 'data',
      validate: function (input) {
        let done = this.async()
        try {
          const data = JSON.parse(
            Buffer.from(input, 'base64').toString('ascii'))
          if (!data.BoxConfig || !data.User || !data.RssFeed) {
            throw new Error()
          }
        } catch (e) {
          done('Invalid input')
        }
        done(null, true)
      },
    },
  ]).then((_) => {
    const data = JSON.parse(
      Buffer.from(_.data, 'base64').toString('ascii'),
    )

    Promise.resolve().
      then(() => BoxConfig.destroy({ truncate: true })).
      then(() => User.destroy({ truncate: true })).
      then(() => RssFeed.destroy({ truncate: true })).
      then(() => BoxConfig.bulkCreate(data.BoxConfig)).
      then(() => User.bulkCreate(data.User)).
      then(() => RssFeed.bulkCreate(data.RssFeed)).
      then(() => console.log('import completed without error')).
      catch(console.err)
  })
})
