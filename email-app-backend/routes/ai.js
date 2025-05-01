const router = require('express').Router();
const { chat, history } = require('../controllers/chatController');
const rateLimit = require('express-rate-limit');


const aiLimiter = rateLimit({
    windowMs: 60 * 1000,          // 1 minute
    max: 15,                       // 20 calls / user / min
    standardHeaders: true,
    legacyHeaders: false
  });

router.post('/chat', aiLimiter, chat);
router.get('/history', history);

module.exports = router;
