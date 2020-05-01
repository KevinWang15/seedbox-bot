'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // queryInterface.addColumn('rss_feeds', 'max_share_ratio', Sequelize.DECIMAL(10, 2));
    return Promise.resolve();
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve();
    /*
     Add reverting commands here.
     Return a promise to correctly handle asynchronicity.

     Example:
     return queryInterface.dropTable('users');
     */
  },
};
