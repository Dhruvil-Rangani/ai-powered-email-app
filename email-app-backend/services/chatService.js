const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.saveChat = (role, content, userId = null) =>
  prisma.chatMessage.create({ data: { role, content, userId } });

exports.getHistory = (limit = 20, userId = null) =>
  prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  }).then(list => list.reverse());   // oldest → newest
