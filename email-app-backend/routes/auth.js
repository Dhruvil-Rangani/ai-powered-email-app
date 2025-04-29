const router = require('express').Router();
const c = require('../controllers/authController');

router.post('/register', c.register);
router.post('/login',    c.login);
router.post('/refresh',  c.refresh);
router.post('/logout',   c.logout);

module.exports = router;
