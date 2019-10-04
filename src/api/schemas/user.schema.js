const db = require('../../config/database');

const user = db.define('users', {
    nick: { type: db.Sequelize.STRING, primaryKey: true },
    name: { type: db.Sequelize.STRING, allowNull: false },
    email: { type: db.Sequelize.STRING, allowNull: false },
    password: { type: db.Sequelize.STRING, allowNull: true },
});

module.exports = user;
