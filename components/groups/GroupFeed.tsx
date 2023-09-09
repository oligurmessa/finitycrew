import useGroups from '@/hooks/useGroups';

import GroupItem from './GroupItem';

const GroupFeed = () => {
  const { data: groups = [], isLoading } = useGroups();

  if (!isLoading && groups.length === 0) {
    return (
      <div className="text-neutral-600 text-center p-6 text-xl">
        You are not in any Equb yet. Start one or join an open one.
      </div>
    )
  }

  return (
    <>
      {groups.map((group: Record<string, any>) => (
        <GroupItem key={group.id} data={group} />
      ))}
    </>
  );
};

export default GroupFeed;
