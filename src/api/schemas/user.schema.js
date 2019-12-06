const { Model, DataTypes } = require('sequelize');

class User extends Model {
    static init(sequelize) {
        super.init({
            nick: { type: DataTypes.STRING, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false },
            password: { type: DataTypes.STRING, allowNull: true },
        }, { sequelize, tableName: 'users' });
    }

    static associate(models) {
        this.hasOne(models.Bucket, {
            foreignKey: 'user_nick',
            as: 'bucket',
            onUpdate: 'cascade',
            onDelete: 'cascade',
        });
    }
}

module.exports = User;
