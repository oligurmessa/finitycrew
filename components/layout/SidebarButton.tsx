import { useCallback } from "react";
import { FaPlus } from "react-icons/fa";

import useLoginModal from "@/hooks/useLoginModal";
import useCurrentUser from "@/hooks/useCurrentUser";
import useCreateGroupModal from "@/hooks/useCreateGroupModal";

const SidebarButton = () => {
  const loginModal = useLoginModal();
  const createGroupModal = useCreateGroupModal();
  const { data: currentUser } = useCurrentUser();

  const onClick = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    createGroupModal.onOpen();
  }, [loginModal, createGroupModal, currentUser]);

  return (
    <div onClick={onClick}>
      <div className="
        mt-6
        lg:hidden 
        rounded-full 
        h-14
        w-14
        p-4
        flex
        items-center
        justify-center 
        bg-orange-500 
        hover:bg-opacity-80 
        transition 
        cursor-pointer
      ">
        <FaPlus size={24} color="white" />
      </div>
      <div className="
        mt-6
        hidden 
        lg:block 
        px-4
        py-2
        rounded-full
        bg-orange-500
        hover:bg-opacity-90 
        cursor-pointer
      ">
        <p 
          className="
            hidden 
            lg:block 
            text-center
            font-semibold
            text-white 
            text-[20px]
        ">
          New Equb
        </p>
      </div>
    </div>
  );
};

export default SidebarButton;
