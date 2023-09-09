import { useRouter } from 'next/router';

import useGroup from '@/hooks/useGroup';

import Avatar from '../Avatar';

interface MemberListProps {
  groupId: string;
}

// Members in payout order once the draw has happened, join order before.
const MemberList: React.FC<MemberListProps> = ({ groupId }) => {
  const router = useRouter();
  const { data: group } = useGroup(groupId);

  const members: Record<string, any>[] = [...group.memberships].sort(
    (a: Record<string, any>, b: Record<string, any>) => (a.payoutOrder || 0) - (b.payoutOrder || 0)
  );

  const paidRounds: Record<string, any>[] = group.rounds.filter((r: Record<string, any>) => r.status === 'paid');

  return (
    <div className="border-b-[1px] border-neutral-800 p-5">
      <h2 className="text-white text-xl font-semibold">
        {group.status === 'open' ? 'Members' : 'Payout order'}
      </h2>
      <div className="flex flex-col gap-4 mt-4">
        {members.map((member) => {
          const received = paidRounds.some((r) => r.recipientId === member.userId);
          const isCurrent = group.status === 'active' && member.payoutOrder === group.currentRound;

          return (
            <div
              key={member.id}
              onClick={() => router.push(`/users/${member.userId}`)}
              className="flex flex-row items-center gap-4 cursor-pointer"
            >
              {member.payoutOrder && (
                <p className="text-neutral-500 w-6 text-right">{member.payoutOrder}</p>
              )}
              <Avatar userId={member.userId} />
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">
                  {member.user.name}
                  {member.userId === group.ownerId && (
                    <span className="text-neutral-500 font-normal"> · organizer</span>
                  )}
                </p>
                <p className="text-neutral-400 text-sm">@{member.user.username}</p>
              </div>
              {received && <p className="text-green-500 text-sm">Received</p>}
              {isCurrent && !received && <p className="text-orange-500 text-sm">This round</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberList;
