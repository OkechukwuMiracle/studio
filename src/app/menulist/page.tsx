"use client";
import Image from "next/image";
import OngaLogo from "@/assets/onga-logo.png"
import { MenuList } from "@/components/menu-list";
import { useState } from "react";
import { RecaptchaVerifier } from "firebase/auth";
import { submitPhoneNumber } from "../actions";
import { auth } from "@/lib/firebase";
import RecaptchaClient from "../components/RecaptchaClient";

export default function MenuListPage() {
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
 const [result, setResult] = useState<any>();
 const handleSubmit = async (formData: FormData) => {
     //add the verifier to the form data
     if (recaptchaVerifier) {
         formData.append("recaptchaVerifier", JSON.stringify(recaptchaVerifier));
     }
     const res = await submitPhoneNumber(null, formData);
     setResult(res);
 }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 bg-cover bg-center bg-no-repeat "
        style={{backgroundImage: ("url('/PETTE.png' )")}}>
          <div className="w-full max-w-4xl flex flex-col items-center space-y-8  "
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
               </header>

            {/* Content Section */}
            <div className="w-full flex flex-col md:flex-row items-start justify-center gap-8 md:gap-12">
    
              {/* Menu Section */} 
               <section className="w-full m-auto md:flex-1 order-2 md:order-1">
                 
                 <RecaptchaClient setRecaptchaVerifier={setRecaptchaVerifier} auth={auth} />
                 <form action={handleSubmit}>
                    <input type="text" name="phoneNumber" />
                    <input type="text" name="otp" />
                    <button type="submit">submit</button>
                 </form>
              </section>
    
            </div>
    
             
             <footer className="mt-12 text-center text-sm text-black">
               © {new Date().getFullYear()} Onga Village Event. Enjoy the celebration!
             </footer>
    
          </div>
        </main>
    );
  }