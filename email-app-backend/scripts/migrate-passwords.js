require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Encryption functions (same as in userService.js)
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const ENCRYPTION_IV = Buffer.from(process.env.ENCRYPTION_IV, 'hex');

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, ENCRYPTION_IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

async function migratePasswords() {
  console.log('Starting password migration...');
  
  try {
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to migrate`);

    // Process each user
    for (const user of users) {
      console.log(`\nProcessing user: ${user.email}`);
      
      // Skip if password is already encrypted (check if it's in hex format)
      if (/^[0-9a-f]+$/.test(user.imapPassword)) {
        console.log('Password already encrypted, skipping...');
        continue;
      }

      // Encrypt the password
      const encryptedPassword = encrypt(user.imapPassword);
      
      // Update the user record
      await prisma.user.update({
        where: { id: user.id },
        data: { imapPassword: encryptedPassword }
      });

      console.log('Password encrypted and updated successfully');
    }

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migratePasswords().catch(console.error); 