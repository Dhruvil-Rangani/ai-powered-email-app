const express = require('express');
const router = express.Router();
const { sendEmail, getInboxEmails } = require('../controllers/emailController');

router.post('/send', sendEmail);
router.get('/inbox', getInboxEmails);

module.exports = router;
