require('dotenv').config();

const path = require('path');

module.exports = {
  storage: path.join(__dirname, '../../../data/storage.sqlite'),
  dialect: 'sqlite',
  logging: false,
};
