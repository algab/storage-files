const router = require('express').Router();
const model = require('../../models/folder.model');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const controller = require('./controllers/folder.controller');

module.exports = (app) => {
    const folder = controller(app);

    router.post('/', auth.folder, validate(model), folder.save);
    router.get('/:name', auth.folder, folder.stats);
    router.put('/:name', auth.folder, validate(model), folder.edit);
    router.delete('/:name', auth.folder, folder.delete);

    return router;
};
