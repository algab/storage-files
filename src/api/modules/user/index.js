const router = require('express').Router();

const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const schema = require('../../schemas/user.schema');

const user = require('./controllers/user.controller');

router.post('/', validate(schema), user.save);
router.get('/', auth.manager, user.list);
router.get('/:nick', auth.user, user.search);
router.put('/:nick', auth.user, validate(schema), user.edit);
router.put('/:nick/password', auth.user, user.password);
router.put('/:nick/token', auth.user, user.token);
router.delete('/:nick', auth.user, user.delete);

module.exports = router;
