import { NextApiRequest, NextApiResponse } from "next";

import serverAuth from "@/libs/serverAuth";
import prisma from "@/libs/prismadb";
import notify from "@/libs/notify";

// POST = join the group, DELETE = leave it. Both only work before it starts,
// because after the draw everyone is committed to the full cycle.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
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

    if (group.status !== 'open') {
      return res.status(400).json({ error: 'This Equb has already started' });
    }

    const membership = group.memberships.find((m) => m.userId === currentUser.id);

    if (req.method === 'POST') {
      if (membership) {
        return res.status(400).json({ error: 'You are already a member' });
      }

      if (group.memberships.length >= group.maxMembers) {
        return res.status(400).json({ error: 'This Equb is full' });
      }

      await prisma.membership.create({
        data: { groupId, userId: currentUser.id }
      });

      await notify([group.ownerId], `${currentUser.name} joined ${group.name}`);
    }

    if (req.method === 'DELETE') {
      if (!membership) {
        return res.status(400).json({ error: 'You are not a member' });
      }

      if (group.ownerId === currentUser.id) {
        return res.status(400).json({ error: 'The organizer cannot leave' });
      }

      await prisma.membership.delete({ where: { id: membership.id } });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
