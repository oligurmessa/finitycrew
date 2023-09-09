import { NextApiRequest, NextApiResponse } from "next";

import serverAuth from "@/libs/serverAuth";
import prisma from "@/libs/prismadb";
import { safeUserSelect } from "@/libs/safeUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    await serverAuth(req, res);

    const { groupId } = req.query;

    if (!groupId || typeof groupId !== 'string') {
      throw new Error('Invalid ID');
    }

    const group = await prisma.group.findUnique({
      where: {
        id: groupId
      },
      include: {
        memberships: {
          include: { user: { select: safeUserSelect } },
          orderBy: { joinedAt: 'asc' }
        },
        rounds: {
          include: { contributions: true },
          orderBy: { number: 'asc' }
        }
      }
    });

    if (!group) {
      return res.status(404).end();
    }

    return res.status(200).json(group);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
