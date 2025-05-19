// middleware/upload.js
const multer = require('multer');
const storage = multer.memoryStorage();           // keeps file in RAM buffer
module.exports = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },        // 10 MB per file
});
