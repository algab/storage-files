const router = require('express').Router();
const model = require('../../models/user.model').user;
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const controller = require('./controllers/user.controller');

module.exports = (app) => {
    const user = controller(app);

    router.post('/', validate(model), user.save);
    router.get('/', auth.manager, user.list);
    router.get('/:nick', auth.user, user.search);
    router.put('/:nick', auth.user, validate(model), user.edit);
    router.put('/:nick/password', auth.user, user.password);
    router.put('/:nick/token', auth.user, user.token);
    router.delete('/:nick', auth.user, user.delete);

    return router;
};
