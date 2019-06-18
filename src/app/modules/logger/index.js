const router = require('express').Router();
const auth = require('../../middlewares/auth');
const controller = require('./controllers/logger.controller');

module.exports = (app) => {
    const logger = controller(app);

    router.get('/', auth.manager, logger.list);

    return router;
};
