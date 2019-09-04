const joi = require('joi');

const db = require('../../config/database');
const user = require('./user.model').dbUser;

const bucket = {
    name: joi.string().regex(/^[a-z,0-9]+$/).min(4).required(),
    user_nick: joi.string().regex(/^[a-z,0-9]+$/).min(4).required(),
    private: joi.boolean().required(),
};

const dbBucket = db.define('buckets', {
    id: { type: db.Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: db.Sequelize.STRING, allowNull: false },
    private: { type: db.Sequelize.BOOLEAN, allowNull: false },
    user_nick: {
        type: db.Sequelize.STRING,
        allowNull: false,
        references: { model: user, key: 'nick' },
    },
});

user.hasOne(dbBucket, {
    foreignKey: 'user_nick',
    as: 'bucket',
    onDelete: 'cascade',
    hooks: true,
});

module.exports = { bucket, dbBucket };
