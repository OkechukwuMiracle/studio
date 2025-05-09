"use client";
import Image from "next/image";
import OngaLogo from "@/assets/onga-logo.png"
import { MenuList } from "@/components/menu-list";
// Removed useState, RecaptchaVerifier, submitPhoneNumber, auth, RecaptchaClient as they are not used directly on this page anymore.
// The MenuList component handles its own logic.

export default function MenuListPage() {
    // Removed local state for recaptchaVerifier and result, and the local handleSubmit function.
    // The MenuList component now handles the form submission and interaction with server actions.

    return (
        <main className="flex min-h-screen flex-col items-center justify-start py-12 px-6 md:px-12 bg-cover bg-center bg-no-repeat"
        style={{backgroundImage: ("url('/PETTE.png' )")}}>
          <div className="w-full max-w-4xl flex flex-col items-center space-y-8 lg:border-[2px] lg:border-black/20 lg:bg-white/50 lg:p-8 lg:rounded-xl" 
          >
    
            {/* Header Section */}
            <header className="text-center space-y-4">
               <Image
                  src={OngaLogo}
                  alt="Onga Village Event Logo"
                  width={200}
                  height={105}
                  className="mx-auto rounded-md shadow-sm"
                  data-ai-hint="logo brand"
                />
                <h1 className="text-3xl md:text-4xl font-bold text-red-600 italic">Select Your Meal</h1>
                <p className="text-md text-foreground">Choose your desired food and drinks from the Onga Village menu.</p>
               </header>

            {/* Content Section */}
            <div className="w-full flex flex-col items-start justify-center gap-8 md:gap-12">
    
              {/* Menu Section */} 
               <section className="w-full m-auto md:flex-1">
                 {/* The MenuList component contains the entire form, including food/drink selection, phone input, and OTP handling */}
                 <MenuList />
              </section>
    
            </div>
    
             
             <footer className="mt-12 text-center text-sm text-black">
               © {new Date().getFullYear()} Onga Village Event. Enjoy the celebration!
             </footer>
    
          </div>
        </main>
    );
  }
