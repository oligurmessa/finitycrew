import prisma from '@/libs/prismadb';

// Notifications are a nice-to-have, so a failure here should never break
// the request that triggered it.
const notify = async (userIds: string[], body: string) => {
  try {
    const ids = Array.from(new Set(userIds));

    for (const userId of ids) {
      await prisma.notification.create({ data: { body, userId } });
    }

    await prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { hasNotification: true },
    });
  } catch (error) {
    console.log(error);
  }
};

export default notify;
