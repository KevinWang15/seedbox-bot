import Sequelize from 'sequelize';
import { sequelize } from "../databaseConnection";
import { User } from './User';

const AutoDelConfig = sequelize.define('auto_del_config', {
  user_id: Sequelize.INTEGER,
  exempt_label: Sequelize.STRING,
  max_disk_usage_size_gb: Sequelize.INTEGER,
});

AutoDelConfig.belongsTo(User, { foreignKey: 'user_id' });
export { AutoDelConfig };