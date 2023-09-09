import axios from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { AiFillCheckCircle, AiOutlineClockCircle } from 'react-icons/ai';

import useCurrentUser from '@/hooks/useCurrentUser';
import useGroup from '@/hooks/useGroup';
import { formatMoney, potSize } from '@/libs/equb';
import errorMessage from '@/libs/errorMessage';

import Avatar from '../Avatar';
import Button from '../Button';

interface RoundPanelProps {
  groupId: string;
}

// The round that is collecting right now: who gets the pot, who has paid in.
const RoundPanel: React.FC<RoundPanelProps> = ({ groupId }) => {
  const { data: currentUser } = useCurrentUser();
  const { data: group, mutate: mutateGroup } = useGroup(groupId);

  const [isLoading, setIsLoading] = useState(false);

  const contribute = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);

      await axios.post(`/api/groups/${groupId}/contribute`, { userId });

      toast.success('Contribution recorded');
      mutateGroup();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [groupId, mutateGroup]);

  const payOut = useCallback(async () => {
    try {
      setIsLoading(true);

      await axios.post(`/api/groups/${groupId}/payout`);

      toast.success('Pot paid out');
      mutateGroup();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [groupId, mutateGroup]);

  const round = group.rounds.find((r: Record<string, any>) => r.number === group.currentRound);

  if (group.status !== 'active' || !round) {
    return null;
  }

  const members: Record<string, any>[] = group.memberships;
  const paidIds: string[] = round.contributions.map((c: Record<string, any>) => c.userId);
  const recipient = members.find((m) => m.userId === round.recipientId);
  const isOwner = group.ownerId === currentUser?.id;
  const everyonePaid = paidIds.length === members.length;

  return (
    <div className="border-b-[1px] border-neutral-800 p-5">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-white text-xl font-semibold">
          Round {round.number} of {members.length}
        </h2>
        <p className="text-neutral-500">Due {format(new Date(round.dueDate), 'MMM d, yyyy')}</p>
      </div>
      <p className="text-neutral-400 mt-2">
        <span className="text-white font-semibold">{recipient?.user.name}</span> receives{' '}
        {formatMoney(potSize(group.contributionAmount, members.length))} this round.
        {' '}{paidIds.length} of {members.length} have paid in.
      </p>
      <div className="flex flex-col gap-4 mt-4">
        {members.map((member) => {
          const hasPaid = paidIds.includes(member.userId);
          const isMe = member.userId === currentUser?.id;

          return (
            <div key={member.id} className="flex flex-row items-center gap-4">
              <Avatar userId={member.userId} />
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{member.user.name}</p>
                <p className="text-neutral-400 text-sm">@{member.user.username}</p>
              </div>
              {hasPaid ? (
                <div className="flex flex-row items-center gap-1 text-green-500">
                  <AiFillCheckCircle size={20} />
                  <p>Paid</p>
                </div>
              ) : (isMe || isOwner) ? (
                <Button
                  secondary={isMe}
                  outline={!isMe}
                  disabled={isLoading}
                  label={isMe ? 'Mark my payment' : 'Mark paid'}
                  onClick={() => contribute(member.userId)}
                />
              ) : (
                <div className="flex flex-row items-center gap-1 text-neutral-500">
                  <AiOutlineClockCircle size={20} />
                  <p>Waiting</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isOwner && (
        <div className="mt-6">
          <Button
            fullWidth
            disabled={isLoading || !everyonePaid}
            label={everyonePaid ? `Pay out to ${recipient?.user.name}` : 'Waiting for all contributions'}
            onClick={payOut}
          />
        </div>
      )}
    </div>
  );
};

export default RoundPanel;
