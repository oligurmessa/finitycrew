import axios from "axios";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";

import useCreateGroupModal from "@/hooks/useCreateGroupModal";
import useGroups from "@/hooks/useGroups";
import { FREQUENCIES, formatMoney, potSize } from "@/libs/equb";
import errorMessage from "@/libs/errorMessage";

import Input from "../Input";
import Modal from "../Modal";

const CreateGroupModal = () => {
  const router = useRouter();
  const createGroupModal = useCreateGroupModal();
  const { mutate: mutateGroups } = useGroups();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [frequency, setFrequency] = useState('monthly');

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: group } = await axios.post('/api/groups', {
        name,
        description,
        contributionAmount,
        maxMembers,
        frequency,
      });

      toast.success('Equb created');
      mutateGroups();

      setName('');
      setDescription('');
      setContributionAmount('');
      setMaxMembers('');

      createGroupModal.onClose();
      router.push(`/groups/${group.id}`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [name, description, contributionAmount, maxMembers, frequency, mutateGroups, createGroupModal, router]);

  const pot = potSize(Number(contributionAmount) || 0, Number(maxMembers) || 0);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Name (e.g. Family Equb)"
        onChange={(e) => setName(e.target.value)}
        value={name}
        disabled={isLoading}
      />
      <Input
        placeholder="Description (optional)"
        onChange={(e) => setDescription(e.target.value)}
        value={description}
        disabled={isLoading}
      />
      <Input
        placeholder="Contribution per round ($)"
        type="number"
        onChange={(e) => setContributionAmount(e.target.value)}
        value={contributionAmount}
        disabled={isLoading}
      />
      <Input
        placeholder="Number of members"
        type="number"
        onChange={(e) => setMaxMembers(e.target.value)}
        value={maxMembers}
        disabled={isLoading}
      />
      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
        disabled={isLoading}
        className="
          w-full
          p-4
          text-lg
          bg-black
          border-2
          border-neutral-800
          rounded-md
          outline-none
          text-white
          capitalize
          focus:border-orange-500
        "
      >
        {FREQUENCIES.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {pot > 0 && (
        <p className="text-neutral-400">
          Each round one member takes home {formatMoney(pot)}.
        </p>
      )}
    </div>
  )

  return (
    <Modal
      disabled={isLoading}
      isOpen={createGroupModal.isOpen}
      title="Start an Equb"
      actionLabel="Create"
      onClose={createGroupModal.onClose}
      onSubmit={onSubmit}
      body={bodyContent}
    />
  );
}

export default CreateGroupModal;
