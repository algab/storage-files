const router = require('express').Router();

const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const schema = require('../../schemas/bucket.schema');

const bucket = require('./controllers/bucket.controller');

router.post('/', validate(schema), bucket.save);
router.get('/:name', auth.bucketUser, bucket.stats);
router.put('/:name', auth.bucketUser, validate(schema), bucket.edit);
router.delete('/:name', auth.bucketUser, bucket.delete);

module.exports = router;
