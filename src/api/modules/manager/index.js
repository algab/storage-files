const router = require('express').Router();
const model = require('../../models/manager.model');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const manager = require('./controllers/manager.controller');

router.post('/', auth.manager, validate(model), manager.save);
router.get('/', auth.manager, manager.list);
router.get('/:id', auth.manager, manager.search);
router.put('/:id', auth.manager, validate(model), manager.edit);
router.put('/:id/password', auth.manager, manager.password);
router.delete('/:id', auth.manager, manager.delete);

module.exports = router;
