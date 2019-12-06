const { Model, DataTypes } = require('sequelize');

class Manager extends Model {
    static init(sequelize) {
        super.init({
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false },
            password: { type: DataTypes.STRING, allowNull: true },
        }, { sequelize, tableName: 'managers' });
    }
}

module.exports = Manager;
