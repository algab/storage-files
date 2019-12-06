const { Model, DataTypes } = require('sequelize');

class Bucket extends Model {
    static init(sequelize) {
        super.init({
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            private: { type: DataTypes.BOOLEAN, allowNull: false },
            user_nick: { type: DataTypes.STRING, allowNull: false },
        }, { sequelize, tableName: 'buckets' });
    }
}

module.exports = Bucket;
