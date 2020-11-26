const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Bucket extends Model {}
  Bucket.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      private: { type: DataTypes.BOOLEAN, allowNull: false },
      user_nick: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      tableName: 'buckets',
      modelName: 'Bucket',
    }
  );
  return Bucket;
};
