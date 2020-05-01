'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // queryInterface.removeColumn('rss_feeds', 'max_share_ratio');
    return queryInterface.addColumn('box_configs', 'max_share_ratio', Sequelize.DECIMAL(10, 2));
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
