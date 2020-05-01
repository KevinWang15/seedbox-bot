'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('rss_feeds', 'min_size_mb', Sequelize.INTEGER);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve();
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
