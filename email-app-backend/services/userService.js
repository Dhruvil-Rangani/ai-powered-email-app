// services/userService.js
const fs           = require('fs');
const path         = require('path');
const bcrypt       = require('bcryptjs');
const crypto       = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma       = new PrismaClient();

const DOMAIN       = process.env.VIRTUAL_DOMAIN;   // e.g. "dhruvilrangani.com"
const VM_MAIL_ROOT = process.env.VMAIL_ROOT;       // e.g. "/var/mail/vhosts"
const VM_UID       = 5000;                        // vmail user UID
const VM_GID       = 5000;                        // vmail group GID

// Encryption key and IV should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : crypto.randomBytes(32);
const ENCRYPTION_IV = process.env.ENCRYPTION_IV ? Buffer.from(process.env.ENCRYPTION_IV, 'hex') : crypto.randomBytes(16);

// Encryption/Decryption functions
function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, ENCRYPTION_IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, ENCRYPTION_IV);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function createUser(email, plainPassword) {
  // 1) enforce your domain
  if (!email.endsWith(`@${DOMAIN}`)) {
    throw new Error(`Must sign up with a @${DOMAIN} address`);
  }

  // 2) hash the password for login
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  // 3) encrypt the IMAP password
  const encryptedImapPassword = encrypt(plainPassword);

  // 4) store user record
  const user = await prisma.user.create({
    data: { 
      email, 
      passwordHash, 
      imapPassword: encryptedImapPassword 
    }   
  });

  // 5) ensure Maildir exists on disk:
  const localpart = email.split('@')[0];
  const baseDir   = path.join(VM_MAIL_ROOT, DOMAIN, localpart, 'Maildir');

  // create the base Maildir folder & chown it
  fs.mkdirSync(baseDir, { recursive: true });
  fs.chownSync(baseDir, VM_UID, VM_GID);

  // create the three required subfolders & chown them
  for (const sub of ['cur', 'new', 'tmp']) {
    const dir = path.join(baseDir, sub);
    fs.mkdirSync(dir, { recursive: true });
    fs.chownSync(dir, VM_UID, VM_GID);
  }

  // finally, make sure the parent dirs are also vmail:vmail
  const userDir   = path.join(VM_MAIL_ROOT, DOMAIN, localpart);
  const domainDir = path.join(VM_MAIL_ROOT, DOMAIN);
  fs.chownSync(userDir, VM_UID, VM_GID);
  fs.chownSync(domainDir, VM_UID, VM_GID);

  return user;
}

// Helper function to get decrypted IMAP password
async function getImapPassword(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  return decrypt(user.imapPassword);
}

module.exports = { createUser, getImapPassword };
