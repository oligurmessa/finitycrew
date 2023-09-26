import { NextApiRequest, NextApiResponse } from "next";

import serverAuth from "@/libs/serverAuth";
import prisma from "@/libs/prismadb";
import notify from "@/libs/notify";
import { drawPayoutOrder, nextDueDate } from "@/libs/equb";

// The organizer starts the Equb: draw the payout order and open round 1.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { currentUser } = await serverAuth(req, res);
    const { groupId } = req.query;

    if (!groupId || typeof groupId !== 'string') {
      throw new Error('Invalid ID');
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { memberships: true }
    });

    if (!group) {
      return res.status(404).end();
    }

    if (group.ownerId !== currentUser.id) {
      return res.status(403).json({ error: 'Only the organizer can start the Equb' });
    }

    if (group.status !== 'open') {
      return res.status(400).json({ error: 'This Equb has already started' });
    }

    if (group.memberships.length < 2) {
      return res.status(400).json({ error: 'An Equb needs at least 2 members' });
    }

    const order = drawPayoutOrder(group.memberships);

    for (let i = 0; i < order.length; i++) {
      await prisma.membership.update({
        where: { id: order[i].id },
        data: { payoutOrder: i + 1 }
      });
    }

    const now = new Date();

    await prisma.round.create({
      data: {
        groupId,
        number: 1,
        recipientId: order[0].userId,
        dueDate: nextDueDate(now, group.frequency),
      }
    });

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { status: 'active', currentRound: 1, startedAt: now }
    });

    for (let i = 0; i < order.length; i++) {
      await notify(
        [order[i].userId],
        `${group.name} has started. Your payout turn is round ${i + 1} of ${order.length}.`
      );
    }

    return res.status(200).json(updatedGroup);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
