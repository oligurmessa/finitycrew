import useLoginModal from '@/hooks/useLoginModal';
import useRegisterModal from '@/hooks/useRegisterModal';

import Button from './Button';

const Welcome = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  return (
    <div className="py-8 px-5 border-b-[1px] border-neutral-800">
      <h1 className="text-white text-2xl text-center mb-2 font-bold">Welcome to FinityCrew</h1>
      <p className="text-neutral-400 text-center mb-6">
        Save together the Equb way: everyone puts in the same amount each round,
        and each round one member takes the whole pot.
      </p>
      <div className="flex flex-row items-center justify-center gap-4">
        <Button label="Login" onClick={loginModal.onOpen} />
        <Button label="Register" onClick={registerModal.onOpen} secondary />
      </div>
    </div>
  );
};

export default Welcome;
