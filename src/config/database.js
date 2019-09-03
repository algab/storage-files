const Sequelize = require('sequelize');

const database = new Sequelize({
    dialect: 'sqlite',
    storage: './data/storage.sqlite',
    logging: false,
});

module.exports = database;
