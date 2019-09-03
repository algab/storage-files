const router = require('express').Router();
const model = require('../../models/bucket.model');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const controller = require('./controllers/bucket.controller');

module.exports = (app) => {
    const bucket = controller(app);

    router.post('/', auth.bucketUser, validate(model), bucket.save);
    router.get('/:name', auth.bucketUser, bucket.stats);
    router.put('/:name', auth.bucketUser, validate(model), bucket.edit);
    router.delete('/:name', auth.bucketUser, bucket.delete);

    return router;
};
