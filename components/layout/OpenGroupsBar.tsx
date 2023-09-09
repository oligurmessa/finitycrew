import { useRouter } from 'next/router';

import useGroups from '@/hooks/useGroups';
import { formatMoney } from '@/libs/equb';

// Right-hand column: Equbs that still have room.
const OpenGroupsBar = () => {
  const router = useRouter();
  const { data: groups = [] } = useGroups(true);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="px-6 py-4 hidden lg:block">
      <div className="bg-neutral-800 rounded-xl p-4">
        <h2 className="text-white text-xl font-semibold">Open Equbs</h2>
        <div className="flex flex-col gap-6 mt-4">
          {groups.map((group: Record<string, any>) => (
            <div
              key={group.id}
              onClick={() => router.push(`/groups/${group.id}`)}
              className="flex flex-col cursor-pointer hover:opacity-80 transition"
            >
              <p className="text-white font-semibold text-sm">{group.name}</p>
              <p className="text-neutral-400 text-sm">
                {formatMoney(group.contributionAmount)} {group.frequency} · {group.memberships.length}/{group.maxMembers}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpenGroupsBar;
