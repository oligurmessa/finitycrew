import { format } from 'date-fns';

import useGroup from '@/hooks/useGroup';
import { formatMoney } from '@/libs/equb';

interface RoundHistoryProps {
  groupId: string;
}

const RoundHistory: React.FC<RoundHistoryProps> = ({ groupId }) => {
  const { data: group } = useGroup(groupId);

  const paidRounds: Record<string, any>[] = group.rounds
    .filter((r: Record<string, any>) => r.status === 'paid')
    .reverse();

  if (paidRounds.length === 0) {
    return null;
  }

  const nameOf = (userId: string) => {
    const member = group.memberships.find((m: Record<string, any>) => m.userId === userId);
    return member?.user.name;
  };

  return (
    <div className="p-5">
      <h2 className="text-white text-xl font-semibold">Payout history</h2>
      <div className="flex flex-col gap-3 mt-4">
        {paidRounds.map((round) => (
          <div key={round.id} className="flex flex-row items-center justify-between">
            <p className="text-white">
              <span className="text-neutral-500">Round {round.number} · </span>
              {nameOf(round.recipientId)}
            </p>
            <p className="text-neutral-400">
              {formatMoney(round.payoutAmount)} · {format(new Date(round.paidOutAt), 'MMM d, yyyy')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoundHistory;
