import Image from "next/image";
import Link from 'next/link';
import OngaLogo from "@/assets/onga-logo.png"
import Image1 from "@/assets/Image 1.png"
import Image2 from "@/assets/Image 2.png"
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center  bg-cover bg-center bg-no-repeat overflow-hidden "
    style={{backgroundImage: ("url('/PETTE.png' )")}}>
      <div className="w-full max-w-4xl flex flex-col items-center mt-6  overflow-hidden"
      >

        {/* Header Section */}
        <header className="text-center space-y-4">
           <Image
              src={OngaLogo} // Updated seed for 'onga-logo' placeholder
              alt="Onga Village Event Logo"
              width={200}
              height={105}
              className="mx-auto rounded-md shadow-sm"
            />
             {/* Welcome Message */}
        <div className="text-center p-4 bg-inherit  max-w-xl">
          <h2 className="text-4xl md:text-5xl font-normal text-black mb-2 flex items-center justify-center gap-2 italic">
             Your meal is just seconds away 🎉
          </h2>
          
        </div>
        </header>

       
        <div className=" mt-5 flex justify-between items-center ">
            <div className="">
              <Image 
              src={Image1}
              alt=""
              className="absolute w-[20%] bottom-0 left-0 "
              />
            </div>
            <Link href="/menulist" passHref >
            
                <Button  className="cursor-pointer text-black rounded-2xl px-5 py-2 bg-red-500 shadow-2xl border border-black hover:bg-red-800 hover:text-white font-bold ">Claim your meal</Button>
            
            </Link>
            <div className="">
            <Image 
              src={Image2}
              alt=""
              className="absolute w-[20%] bottom-0 right-0 "
              />
            </div>
        </div>

      </div>
    </main>
  );
}
