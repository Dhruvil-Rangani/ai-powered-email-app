// services/tagService.js
const { PrismaClient } = require('../prisma/prisma/generated/client');
const prisma = new PrismaClient();

const addTag = async ( userId, messageId, label) => {
  return prisma.tag.create({
    data: { 
        userId,
        emailId: messageId, 
        label 
    }
  });
};

const getTags = async (userId, emailId) => {
  return prisma.tag.findMany({ where: { userId, emailId } });
};

const filterEmailsByTag = async (userId, label) => {
  return prisma.tag.findMany({ where: {userId, label } });
};

module.exports = { addTag, getTags, filterEmailsByTag };
