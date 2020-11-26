const bucket = require('./modules/bucket');
const folder = require('./modules/folder');
const logger = require('./modules/logger');
const login = require('./modules/login');
const manager = require('./modules/manager');
const object = require('./modules/object');
const user = require('./modules/user');
const root = require('./modules/root');

module.exports = async (app) => {
  app.use(`${app.get('version')}/buckets`, bucket);
  app.use(`${app.get('version')}/folders`, folder);
  app.use(`${app.get('version')}/logs`, logger);
  app.use(`${app.get('version')}/login`, login);
  app.use(`${app.get('version')}/managers`, manager);
  app.use(`${app.get('version')}/objects`, object);
  app.use(`${app.get('version')}/users`, user);
  app.use('', root);
};
