import useSWR from 'swr';

import fetcher from '@/libs/fetcher';

const useGroup = (groupId?: string) => {
  const { data, error, isLoading, mutate } = useSWR(groupId ? `/api/groups/${groupId}` : null, fetcher);

  return {
    data,
    error,
    isLoading,
    mutate
  }
};

export default useGroup;
