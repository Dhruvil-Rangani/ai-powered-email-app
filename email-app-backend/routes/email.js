const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  sendEmail,
  getInboxEmails,
  downloadAttachment,
  tagEmail,
  getEmailTags,
  getEmailsByTag,
  removeTag,
} = require('../controllers/emailController');

// Email Routes with authentication
router.post('/send', authenticate, upload.array('attachments'), sendEmail);
router.get('/threads', authenticate, getInboxEmails);
router.get('/:messageId/attachments/:filename', authenticate, downloadAttachment);

// Tag Routes with authentication
router.post('/tags', authenticate, tagEmail);
router.get('/tags/:messageId', authenticate, getEmailTags);
router.get('/tags/by/:label', authenticate, getEmailsByTag);
router.delete('/tags/:messageId/:tagId', authenticate, removeTag);

module.exports = router; 