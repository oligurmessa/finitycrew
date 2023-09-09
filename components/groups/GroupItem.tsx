import { useRouter } from 'next/router';
import { useCallback } from 'react';

import { formatMoney, potSize } from '@/libs/equb';

import GroupStatus from './GroupStatus';

interface GroupItemProps {
  data: Record<string, any>;
}

const GroupItem: React.FC<GroupItemProps> = ({ data }) => {
  const router = useRouter();

  const goToGroup = useCallback(() => {
    router.push(`/groups/${data.id}`);
  }, [router, data.id]);

  const memberCount = data.memberships?.length || 0;

  return (
    <div
      onClick={goToGroup}
      className="
        border-b-[1px]
        border-neutral-800
        p-5
        cursor-pointer
        hover:bg-neutral-900
        transition
      ">
      <div className="flex flex-row items-center justify-between gap-3">
        <p className="text-white text-lg font-semibold">{data.name}</p>
        <GroupStatus status={data.status} />
      </div>
      <p className="text-neutral-400 mt-1">
        {formatMoney(data.contributionAmount)} {data.frequency} · {memberCount}/{data.maxMembers} members
      </p>
      <p className="text-neutral-500 text-sm mt-1">
        {data.status === 'active'
          ? `Round ${data.currentRound} of ${memberCount} · pot ${formatMoney(potSize(data.contributionAmount, memberCount))}`
          : `Pot when full: ${formatMoney(potSize(data.contributionAmount, data.maxMembers))}`}
      </p>
    </div>
  )
}

export default GroupItem;
