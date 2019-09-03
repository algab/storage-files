const router = require('express').Router();
const controller = require('./controllers/login.controller');

module.exports = (app) => {
    const login = controller(app);

    router.post('/', login.login);
    router.put('/password', login.password);

    return router;
};
