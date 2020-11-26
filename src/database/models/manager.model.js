const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Manager extends Model {}
  Manager.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      tableName: 'managers',
      modelName: 'Manager',
    }
  );
  return Manager;
};
