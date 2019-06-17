const router = require('express').Router();
const auth = require('../../middlewares/auth');
const verify = require('../../middlewares/verify');
const controller = require('./controllers/root.controller');

module.exports = (app) => {
    const root = controller(app);

    router.get('/:bucket', auth.verifyBucket, root.bucket);
    router.get('/:bucket/:param', auth.verifyBucket, verify.folder, root.folder);
    router.get('/:bucket/:folder/:object', auth.verifyBucket, root.object);

    return router;
};
