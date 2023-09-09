import axios from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

import useCurrentUser from '@/hooks/useCurrentUser';
import useGroup from '@/hooks/useGroup';
import useGroups from '@/hooks/useGroups';
import { formatMoney, potSize } from '@/libs/equb';
import errorMessage from '@/libs/errorMessage';

import Button from '../Button';
import GroupStatus from './GroupStatus';

interface GroupSummaryProps {
  groupId: string;
}

// Top of the group page: the terms of the Equb and join / leave / start.
const GroupSummary: React.FC<GroupSummaryProps> = ({ groupId }) => {
  const { data: currentUser } = useCurrentUser();
  const { data: group, mutate: mutateGroup } = useGroup(groupId);
  const { mutate: mutateMyGroups } = useGroups();
  const { mutate: mutateOpenGroups } = useGroups(true);

  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(async (method: 'post' | 'delete', path: string, success: string) => {
    try {
      setIsLoading(true);

      await axios({ method, url: `/api/groups/${groupId}/${path}` });

      toast.success(success);
      mutateGroup();
      mutateMyGroups();
      mutateOpenGroups();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [groupId, mutateGroup, mutateMyGroups, mutateOpenGroups]);

  const memberCount = group.memberships.length;
  const isMember = group.memberships.some((m: Record<string, any>) => m.userId === currentUser?.id);
  const isOwner = group.ownerId === currentUser?.id;
  const isOpen = group.status === 'open';

  // before it starts the pot depends on how many people end up joining
  const pot = potSize(group.contributionAmount, isOpen ? group.maxMembers : memberCount);

  return (
    <div className="border-b-[1px] border-neutral-800 p-5">
      <div className="flex flex-row items-center justify-between">
        <GroupStatus status={group.status} />
        <div className="flex flex-row gap-2">
          {isOpen && !isMember && (
            <Button
              secondary
              disabled={isLoading || memberCount >= group.maxMembers}
              label={memberCount >= group.maxMembers ? 'Full' : 'Join'}
              onClick={() => request('post', 'join', 'Joined')}
            />
          )}
          {isOpen && isMember && !isOwner && (
            <Button outline disabled={isLoading} label="Leave" onClick={() => request('delete', 'join', 'Left')} />
          )}
          {isOpen && isOwner && (
            <Button
              disabled={isLoading || memberCount < 2}
              label="Start Equb"
              onClick={() => request('post', 'start', 'Equb started')}
            />
          )}
        </div>
      </div>
      {group.description && <p className="text-white mt-4">{group.description}</p>}
      <div className="flex flex-row items-center mt-4 gap-6 flex-wrap">
        <div className="flex flex-row items-center gap-1">
          <p className="text-white">{formatMoney(group.contributionAmount)}</p>
          <p className="text-neutral-500">{group.frequency}</p>
        </div>
        <div className="flex flex-row items-center gap-1">
          <p className="text-white">{memberCount}/{group.maxMembers}</p>
          <p className="text-neutral-500">members</p>
        </div>
        <div className="flex flex-row items-center gap-1">
          <p className="text-white">{formatMoney(pot)}</p>
          <p className="text-neutral-500">pot per round</p>
        </div>
      </div>
      {isOpen && isOwner && memberCount < 2 && (
        <p className="text-neutral-500 text-sm mt-4">
          You need at least 2 members to start. The payout order is drawn at random when you start.
        </p>
      )}
    </div>
  );
};

export default GroupSummary;
