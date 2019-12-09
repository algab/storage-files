const router = require('express').Router();
const model = require('../../models/bucket.model');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const bucket = require('./controllers/bucket.controller');

router.post('/', validate(model), bucket.save);
router.get('/:name', auth.bucketUser, bucket.stats);
router.put('/:name', auth.bucketUser, validate(model), bucket.edit);
router.delete('/:name', auth.bucketUser, bucket.delete);

module.exports = router;
