import { useRouter } from "next/router";
import Image from 'next/image';

const SidebarLogo = () => {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push('/')}
      className="
        rounded-full 
        h-20
        w-20 
        flex 
        items-center 
        justify-center 
        hover:bg-blue-300 
        hover:bg-opacity-10 
        cursor-pointer
        transition-transform duration-300 
        hover:scale-110
      "
    >
      <Image src="/images/FinityCrew.png" alt="FinityCrew Logo" width={80} height={80} layout="responsive" />
    </div>
  );
};

export default SidebarLogo;
