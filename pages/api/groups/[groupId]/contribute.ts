import { NextApiRequest, NextApiResponse } from "next";

import serverAuth from "@/libs/serverAuth";
import prisma from "@/libs/prismadb";

// Records that a member paid into the current round. No real money moves
// through the app; this is the ledger the organizer would keep on paper.
// A member records their own payment, the organizer can record anyone's.
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

    if (group.status !== 'active') {
      return res.status(400).json({ error: 'This Equb is not active' });
    }

    const userId = typeof req.body.userId === 'string' ? req.body.userId : currentUser.id;

    if (userId !== currentUser.id && group.ownerId !== currentUser.id) {
      return res.status(403).json({ error: 'Only the organizer can record for someone else' });
    }

    if (!group.memberships.some((m) => m.userId === userId)) {
      return res.status(400).json({ error: 'Not a member of this Equb' });
    }

    const round = await prisma.round.findUnique({
      where: { groupId_number: { groupId, number: group.currentRound } },
      include: { contributions: true }
    });

    if (!round || round.status !== 'collecting') {
      return res.status(400).json({ error: 'No round is collecting right now' });
    }

    if (round.contributions.some((c) => c.userId === userId)) {
      return res.status(400).json({ error: 'Already contributed this round' });
    }

    const contribution = await prisma.contribution.create({
      data: {
        roundId: round.id,
        userId,
        amount: group.contributionAmount,
      }
    });

    return res.status(200).json(contribution);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
