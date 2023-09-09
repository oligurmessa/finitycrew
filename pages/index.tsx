import Header from "@/components/Header"
import Welcome from "@/components/Welcome"
import Button from "@/components/Button"
import GroupFeed from "@/components/groups/GroupFeed"
import useCurrentUser from "@/hooks/useCurrentUser"
import useCreateGroupModal from "@/hooks/useCreateGroupModal"

export default function Home() {
  const { data: currentUser } = useCurrentUser();
  const createGroupModal = useCreateGroupModal();

  if (!currentUser) {
    return (
      <>
        <Header label="FinityCrew" />
        <Welcome />
      </>
    )
  }

  return (
    <>
      <Header label="My Equbs" />
      <div className="flex flex-row justify-end border-b-[1px] border-neutral-800 px-5 py-3">
        <Button label="Start an Equb" onClick={createGroupModal.onOpen} />
      </div>
      <GroupFeed />
    </>
  )
}
