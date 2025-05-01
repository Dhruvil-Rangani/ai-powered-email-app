// services/userService.js
const fs           = require('fs');
const path         = require('path');
const bcrypt       = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma       = new PrismaClient();

const DOMAIN       = process.env.VIRTUAL_DOMAIN;   // e.g. "dhruvilrangani.com"
const VM_MAIL_ROOT = process.env.VMAIL_ROOT;       // e.g. "/var/mail/vhosts"
const VM_UID       = 5000;                        // vmail user UID
const VM_GID       = 5000;                        // vmail group GID

async function createUser(email, plainPassword) {
  // 1) enforce your domain
  if (!email.endsWith(`@${DOMAIN}`)) {
    throw new Error(`Must sign up with a @${DOMAIN} address`);
  }

  // 2) hash the password
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  // 3) store user record
  const user = await prisma.user.create({
    data: { email, passwordHash }
  });

  // 4) ensure Maildir exists on disk:
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

module.exports = { createUser };
