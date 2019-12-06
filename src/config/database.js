const Sequelize = require('sequelize');

const Bucket = require('../api/schemas/bucket.schema');
const Manager = require('../api/schemas/manager.schema');
const User = require('../api/schemas/user.schema');

const database = new Sequelize({
    dialect: 'sqlite',
    storage: './data/storage.sqlite',
    logging: false,
});

Bucket.init(database);
Manager.init(database);
User.init(database);

User.associate(database.models);

module.exports = database;
