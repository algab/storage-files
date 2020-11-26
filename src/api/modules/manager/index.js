const router = require('express').Router();

const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const schema = require('../../schemas/manager.schema');

const manager = require('./controllers/manager.controller');

router.post('/', auth.manager, validate(schema), manager.save);
router.get('/', auth.manager, manager.list);
router.get('/:id', auth.manager, manager.search);
router.put('/:id', auth.manager, validate(schema), manager.edit);
router.put('/:id/password', auth.manager, manager.password);
router.delete('/:id', auth.manager, manager.delete);

module.exports = router;
