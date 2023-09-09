import useSWR from 'swr';

import fetcher from '@/libs/fetcher';
import useCurrentUser from './useCurrentUser';

// open = false: the Equbs I'm a member of
// open = true:  Equbs that are still looking for members
const useGroups = (open?: boolean) => {
  const { data: currentUser } = useCurrentUser();
  const url = open ? '/api/groups?open=true' : '/api/groups';
  const { data, error, isLoading, mutate } = useSWR(currentUser ? url : null, fetcher);

  return {
    data,
    error,
    isLoading,
    mutate
  }
};

export default useGroups;
