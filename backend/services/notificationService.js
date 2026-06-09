const prisma = require('../prisma/client');

const getAll = async (userId) => {
  console.log('🔔 getAll notifications pour userId:', userId);
  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.notification.count({ where: { userId, isRead: false } })
  ]);
  console.log('🔔 résultat:', notifications.length, 'notifications');
  return { notifications, unread };
};

const markAllRead = async (userId) => {
  await prisma.notification.updateMany({ where: { userId }, data: { isRead: true } });
  return { message: 'Tout marqué comme lu.' };
};

const markRead = async (id, userId) => {
  await prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
  return { message: 'Notification lue.' };
};

module.exports = { getAll, markAllRead, markRead };