import { NextApiRequest, NextApiResponse } from "next";

import serverAuth from "@/libs/serverAuth";
import prisma from "@/libs/prismadb";
import notify from "@/libs/notify";
import { formatMoney, nextDueDate, potSize } from "@/libs/equb";

// The organizer hands the pot to this round's recipient and the rotation
// moves on. After the last member has been paid the Equb is complete.
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
      return res.status(403).json({ error: 'Only the organizer can pay out' });
    }

    if (group.status !== 'active') {
      return res.status(400).json({ error: 'This Equb is not active' });
    }

    const round = await prisma.round.findUnique({
      where: { groupId_number: { groupId, number: group.currentRound } },
      include: { contributions: true }
    });

    if (!round || round.status !== 'collecting') {
      return res.status(400).json({ error: 'No round is collecting right now' });
    }

    const memberCount = group.memberships.length;

    if (round.contributions.length < memberCount) {
      return res.status(400).json({ error: 'Not everyone has contributed yet' });
    }

    const pot = potSize(group.contributionAmount, memberCount);
    const now = new Date();

    await prisma.round.update({
      where: { id: round.id },
      data: { status: 'paid', payoutAmount: pot, paidOutAt: now }
    });

    await notify([round.recipientId], `You received ${formatMoney(pot)} from ${group.name}!`);

    const memberIds = group.memberships.map((m) => m.userId);
    const nextNumber = round.number + 1;
    const nextRecipient = group.memberships.find((m) => m.payoutOrder === nextNumber);

    if (!nextRecipient) {
      // everyone has had their turn
      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: { status: 'completed' }
      });

      await notify(memberIds, `${group.name} is complete. Everyone has been paid out.`);

      return res.status(200).json(updatedGroup);
    }

    // the next due date counts from the previous one so the schedule doesn't
    // drift when a payout is recorded late
    const dueDate = nextDueDate(round.dueDate, group.frequency);

    await prisma.round.create({
      data: {
        groupId,
        number: nextNumber,
        recipientId: nextRecipient.userId,
        dueDate,
      }
    });

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { currentRound: nextNumber }
    });

    await notify(
      memberIds,
      `Round ${nextNumber} of ${group.name} is open. ${formatMoney(group.contributionAmount)} is due ${dueDate.toDateString()}.`
    );

    return res.status(200).json(updatedGroup);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
