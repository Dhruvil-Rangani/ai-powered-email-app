const express = require('express');
const router = express.Router();
const { chat, history } = require('../controllers/chatController');
const rateLimit = require('express-rate-limit');
const { aiSearch } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');


const aiLimiter = rateLimit({
    windowMs: 60 * 1000,          // 1 minute
    max: 15,                       // 15 calls / user / min
    standardHeaders: true,
    legacyHeaders: false
  });

router.post('/chat', aiLimiter, chat);
router.get('/history', history);

// AI search endpoint
router.post('/search', authenticate, aiSearch);

module.exports = router;
