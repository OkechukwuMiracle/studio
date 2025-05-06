
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { allMenuItems } from '@/components/menu-list'; // Import all items for lookup
import Image from "next/image";
import OngaLogo from "@/assets/onga-logo.png"
import Image2 from "@/assets/Image 2 (1).png"

export const dynamic = 'force-dynamic'; // ✅ Disable pre-rendering

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const foodId = searchParams.get('food');
  const drinkIds = searchParams.getAll('drinks'); // Get all drink IDs

  // Find the full item details using the IDs
  const selectedFood = foodId ? allMenuItems.find(item => item.id === foodId) : null;
  const selectedDrinks = drinkIds.map(id => allMenuItems.find(item => item.id === id)).filter(Boolean) as typeof allMenuItems; // Filter out nulls

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 pb-1 md:p-12  bg-cover bg-center bg-repeat"
    style={{backgroundImage: ("url('/PETTE.png' )")}}>
      
        <header className="text-center ">
          {/* <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" /> */}
          <Image
              src={OngaLogo} // Updated seed for 'onga-logo' placeholder
              alt="Onga Village Event Logo"
              width={200}
              height={105}
              className="mx-auto rounded-md shadow-sm"
            />
          <CardTitle className="text-5xl font-normal text-red-600 mt-8 italic">Great Choice!</CardTitle>
        </header>

          

        <CardContent className="p-6  mt-6 bg-white/60 rounded-xl  ">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
               Your Selected Food:
            </h3>
            {selectedFood ? (
              <p className="text-lg text-muted-foreground pl-7">{selectedFood.name}</p>
            ) : (
              <p className="text-lg text-muted-foreground pl-7 italic">No food item found.</p>
            )}
          </div>

          {selectedDrinks.length > 0 && (
            <div className="space-y-2 border-t border-border pt-6">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                 Your Selected Drinks:
              </h3>
              <ul className="list-disc list-inside pl-7 space-y-1">
                {selectedDrinks.map(drink => (
                  <li key={drink.id} className="text-lg text-muted-foreground">{drink.name}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedDrinks.length === 0 && (
             <div className="space-y-2 border-t border-border pt-6">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                   Your Selected Drinks:
                </h3>
                <p className="text-lg text-muted-foreground pl-7 italic">No drinks selected.</p>
              </div>
          )}
          </CardContent>
          <div className='relative'>
            
<div className='mt-7'>
            <Image 
               src={Image2}
               alt=""
               className='w-[100%] m-auto '
            />
          </div>

          <div className="text-center mt-8 absolute bottom-0 right-[-20]">
            {/* <p className="text-muted-foreground mb-4">Enjoy the feast!</p> */}
            <Link href="/" passHref>
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                Enjoy your meal
              </Button>
            </Link>
          </div>
          </div>
        
      
    </main>
  );
}
