import { useRouter } from "next/router";
import { ClipLoader } from "react-spinners";

import useGroup from "@/hooks/useGroup";

import Header from "@/components/Header";
import GroupSummary from "@/components/groups/GroupSummary";
import RoundPanel from "@/components/groups/RoundPanel";
import MemberList from "@/components/groups/MemberList";
import RoundHistory from "@/components/groups/RoundHistory";

const GroupView = () => {
  const router = useRouter();
  const { groupId } = router.query;

  const { data: group, isLoading, error } = useGroup(groupId as string);

  if (error) {
    return (
      <>
        <Header showBackArrow label="Equb" />
        <div className="text-neutral-600 text-center p-6 text-xl">
          Sign in to see this Equb.
        </div>
      </>
    )
  }

  if (isLoading || !group) {
    return (
      <div className="flex justify-center items-center h-full">
        <ClipLoader color="lightblue" size={80} />
      </div>
    )
  }

  return (
    <>
      <Header showBackArrow label={group.name} />
      <GroupSummary groupId={group.id} />
      <RoundPanel groupId={group.id} />
      <MemberList groupId={group.id} />
      <RoundHistory groupId={group.id} />
    </>
   );
}

export default GroupView;
