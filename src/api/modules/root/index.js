const router = require('express').Router();
const auth = require('../../middlewares/auth.middleware');
const verify = require('../../middlewares/verify.middleware');
const controller = require('./controllers/root.controller');

module.exports = (app) => {
    const root = controller(app);

    router.get('/:bucket', auth.verifyBucket, root.bucket);
    router.get('/:bucket/:param', auth.verifyBucket, verify.folder, root.folder);
    router.get('/:bucket/:folder/:object', auth.verifyBucket, root.object);

    return router;
};
