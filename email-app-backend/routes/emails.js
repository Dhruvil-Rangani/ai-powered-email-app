const express = require('express');
const router = express.Router();
const { sendEmail, getInboxEmails, tagEmail, getEmailTags, getEmailsByTag } = require('../controllers/emailController');
const { downloadAttachment } = require('../controllers/emailController');

// Email Routes
router.post('/send', sendEmail);
router.get('/inbox', getInboxEmails);
router.get("/", getInboxEmails);

//Attachments
router.get('/:messageId/attachments/:filename', downloadAttachment);

// Tagging
router.post('/tags', tagEmail);
router.get('/tags/:messageId', getEmailTags);
router.get('/tags/by/:label', getEmailsByTag);

module.exports = router;
