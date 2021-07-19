module.exports = (sequelize, DataTypes) => sequelize.define('Balance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  coin: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  timestamps: false,
  tableName: 'Balance',
  charset: 'utf8',
  collate: 'utf8_unicode_ci',
});
