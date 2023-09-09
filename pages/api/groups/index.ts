import { NextApiRequest, NextApiResponse } from "next";

import serverAuth from "@/libs/serverAuth";
import prisma from "@/libs/prismadb";
import { isFrequency } from "@/libs/equb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { currentUser } = await serverAuth(req, res);

    if (req.method === 'POST') {
      const { name, description, frequency } = req.body;
      const contributionAmount = Number(req.body.contributionAmount);
      const maxMembers = Number(req.body.maxMembers);

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Name is required' });
      }

      if (!(contributionAmount > 0)) {
        return res.status(400).json({ error: 'Contribution must be more than 0' });
      }

      if (!Number.isInteger(maxMembers) || maxMembers < 2 || maxMembers > 50) {
        return res.status(400).json({ error: 'Group size must be between 2 and 50' });
      }

      if (!isFrequency(frequency)) {
        return res.status(400).json({ error: 'Invalid frequency' });
      }

      // the creator is the first member
      const group = await prisma.group.create({
        data: {
          name,
          description,
          contributionAmount,
          frequency,
          maxMembers,
          ownerId: currentUser.id,
          memberships: {
            create: { userId: currentUser.id }
          }
        }
      });

      return res.status(200).json(group);
    }

    // GET /api/groups            -> groups I'm in
    // GET /api/groups?open=true  -> groups still looking for members that I'm not in
    const where = req.query.open === 'true'
      ? { status: 'open', memberships: { none: { userId: currentUser.id } } }
      : { memberships: { some: { userId: currentUser.id } } };

    const groups = await prisma.group.findMany({
      where,
      include: {
        memberships: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json(groups);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
