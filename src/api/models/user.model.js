const joi = require('joi');

const db = require('../../config/database');

const user = {
    nick: joi.string().regex(/^[a-z,0-9]+$/).min(4).required(),
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).max(20),
};

const dbUser = db.define('users', {
    nick: { type: db.Sequelize.STRING, allowNull: false, primaryKey: true },
    name: { type: db.Sequelize.STRING, allowNull: false },
    email: { type: db.Sequelize.STRING, allowNull: false },
    password: { type: db.Sequelize.STRING, allowNull: true },
});

module.exports = { user, dbUser };
