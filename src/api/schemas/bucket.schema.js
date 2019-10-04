const db = require('../../config/database');

const user = require('./user.schema');

const bucket = db.define('buckets', {
    id: { type: db.Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: db.Sequelize.STRING, allowNull: false },
    private: { type: db.Sequelize.BOOLEAN, allowNull: false },
    user_nick: {
        type: db.Sequelize.STRING,
        allowNull: false,
        references: { model: user, key: 'nick' },
    },
});

user.hasOne(bucket, {
    foreignKey: 'user_nick',
    as: 'bucket',
    onDelete: 'cascade',
    hooks: true,
});

module.exports = bucket;
