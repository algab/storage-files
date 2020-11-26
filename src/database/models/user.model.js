const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasOne(models.Bucket, {
        foreignKey: 'user_nick',
        as: 'bucket',
        onUpdate: true,
        onDelete: true,
      });
    }
  }
  User.init(
    {
      nick: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      tableName: 'users',
      modelName: 'User',
    }
  );
  return User;
};
