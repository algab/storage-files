const router = require('express').Router();

const auth = require('../../middlewares/auth.middleware');

const logger = require('./controllers/logger.controller');

router.get('/', auth.manager, logger.list);

module.exports = router;
