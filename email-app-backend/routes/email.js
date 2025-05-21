const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
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

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Email Routes
router.post('/send', upload.array('attachments'), sendEmail);
router.get('/threads', getInboxEmails); // Changed from /inbox to /threads to match frontend
router.get('/:messageId/attachments/:filename', downloadAttachment);

// Tag Routes
router.post('/tags', tagEmail);
router.get('/tags/:messageId', getEmailTags);
router.get('/tags/by/:label', getEmailsByTag);
router.delete('/tags/:messageId/:tagId', removeTag); // Added delete endpoint for tags

module.exports = router; 