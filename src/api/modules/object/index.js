const router = require('express').Router();
const auth = require('../../middlewares/auth.middleware');
const object = require('./controllers/object.controller');

router.post('/upload', auth.object, object.upload);
router.get('/:name', auth.object, object.stats);
router.delete('/:name', auth.object, object.delete);

module.exports = router;
