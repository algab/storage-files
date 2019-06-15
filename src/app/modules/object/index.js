const router = require('express').Router();
const auth = require('../../middlewares/auth');
const controller = require('./controllers/object.controller');

module.exports = (app) => {
    const object = controller(app);

    router.post('/upload', auth.object, object.upload);
    router.get('/:name', auth.object, object.stats);
    router.delete('/:name', auth.object, object.delete);

    return router;
};
