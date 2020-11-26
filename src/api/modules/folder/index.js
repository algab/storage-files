const router = require('express').Router();

const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const schema = require('../../schemas/folder.schema');

const folder = require('./controllers/folder.controller');

router.post('/', auth.folder, validate(schema), folder.save);
router.get('/:name', auth.folder, folder.stats);
router.put('/:name', auth.folder, validate(schema), folder.edit);
router.delete('/:name', auth.folder, folder.delete);

module.exports = router;
