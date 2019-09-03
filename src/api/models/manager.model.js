const joi = require('joi');
const db = require('../../config/database');

const manager = {
    name: joi.string().max(100).required(),
    email: joi.string().email().max(100).required(),
    password: joi.string().min(8).max(20),
};

const dbManager = db.define('users', {
    id: { type: db.Sequelize.STRING, autoIncrement: true, primaryKey: true },
    name: { type: db.Sequelize.STRING, allowNull: false },
    email: { type: db.Sequelize.STRING, allowNull: false },
    password: { type: db.Sequelize.STRING, allowNull: true },
});

module.exports = { manager, dbManager };
