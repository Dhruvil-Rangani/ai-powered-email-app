// services/tagService.js
const { PrismaClient } = require('../prisma/prisma/generated/client');
const prisma = new PrismaClient();

const addTag = async (messageId, label) => {
  return prisma.tag.create({
    data: { 
        emailId: messageId, 
        label 
    }
  });
};

const getTags = async (emailId) => {
  return prisma.tag.findMany({ where: { emailId } });
};

const filterEmailsByTag = async (label) => {
  return prisma.tag.findMany({ where: { label } });
};

module.exports = { addTag, getTags, filterEmailsByTag };
