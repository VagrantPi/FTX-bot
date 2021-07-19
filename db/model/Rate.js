module.exports = (sequelize, DataTypes) => sequelize.define('Rate', {
  coin: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    unique: true 
  },
  rate: {
    type: DataTypes.STRING(12),
    allowNull: false,
  },
  lastSyncTime: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  timestamps: false,
  tableName: 'Rate',
  charset: 'utf8',
  collate: 'utf8_unicode_ci',
});
