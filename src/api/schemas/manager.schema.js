const db = require('../../config/database');

const manager = db.define('managers', {
    id: { type: db.Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: db.Sequelize.STRING, allowNull: false },
    email: { type: db.Sequelize.STRING, allowNull: false },
    password: { type: db.Sequelize.STRING, allowNull: true },
});

module.exports = manager;
