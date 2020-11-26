const router = require('express').Router();

const login = require('./controllers/login.controller');

router.post('/', login.login);
router.put('/password', login.password);

module.exports = router;
