# FinityCrew

A web app for running an **Equb**, the Ethiopian way of saving money as a
group. Everyone in the group puts in the same amount every round (every week,
two weeks or month), and each round one member takes home the whole pot. The
rotation continues until every member has been paid once.

FinityCrew is the organizer's notebook: who is in the group, whose turn it is,
who has paid in this round, and who has already received the pot. No real
money moves through the app.

## What you can do

- Register and sign in
- Start an Equb: name, contribution per round, number of members, frequency
- Browse open Equbs and join (or leave) one before it starts
- Organizer starts the Equb, which draws the payout order at random
- Each round: members mark their contribution, the organizer can mark it for them
- When everyone has paid in, the organizer pays out the pot and the next round opens
- Notifications when someone joins, when it's your turn, when a round opens and when you get paid
- Profile with how many Equbs you're in, how much you've paid in and received

## Tech stack

Next.js 13 (pages router), TypeScript, Tailwind CSS, Prisma with MongoDB,
NextAuth (credentials), SWR and Zustand.

## Running it

```shell
git clone https://github.com/oligurmessa/finitycrew.git
cd finitycrew
npm install
```

Copy `.env.example` to `.env` and fill it in. `DATABASE_URL` is a MongoDB
connection string (a free MongoDB Atlas cluster works), the two secrets can be
any long random strings.

```shell
npx prisma db push
npm run dev
```

Then open http://localhost:3000.

## Where things are

```
prisma/schema.prisma      User, Group, Membership, Round, Contribution, Notification
libs/equb.ts              the Equb rules: pot size, due dates, payout draw
pages/api/groups/         create / list / join / start / contribute / payout
pages/groups/[groupId]    the group page
components/groups/        group list, current round, payout order, history
```

## Credits

This project started from Antonio Erdeljac's
[Twitter clone tutorial](https://www.youtube.com/watch?v=ytkG7RT6SvU),
which I followed to learn the Next.js + Prisma + NextAuth setup. The auth,
layout, modal and profile code come from there. I replaced the posts, comments,
likes and follows with the Equb data model, API and screens.
