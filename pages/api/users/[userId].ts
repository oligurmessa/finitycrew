import { NextApiRequest, NextApiResponse } from "next";

import prisma from '@/libs/prismadb';
import { safeUserSelect } from '@/libs/safeUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid ID');
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: safeUserSelect,
    });

    if (!existingUser) {
      return res.status(404).end();
    }

    // savings summary shown on the profile
    const groupsCount = await prisma.membership.count({ where: { userId } });

    const contributed = await prisma.contribution.aggregate({
      where: { userId },
      _sum: { amount: true }
    });

    const received = await prisma.round.aggregate({
      where: { recipientId: userId, status: 'paid' },
      _sum: { payoutAmount: true }
    });

    return res.status(200).json({
      ...existingUser,
      groupsCount,
      totalContributed: contributed._sum.amount || 0,
      totalReceived: received._sum.payoutAmount || 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
};
