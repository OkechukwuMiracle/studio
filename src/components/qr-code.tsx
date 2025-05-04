"use client";
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';

// In a real app, you might generate this dynamically or fetch it
const generateQrCodeUrl = (url: string) => {
  // Using a free QR code generator API (replace with a more robust solution if needed)
  // Ensure the URL is properly encoded
  const encodedUrl = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
};


export function QrCodeDisplay() {
    const [eventUrl, setEventUrl] = useState<string>('');
    const [qrCodeSrc, setQrCodeSrc] = useState<string>('/placeholder-qr.png'); // Default placeholder

    useEffect(() => {
        // Ensure this runs only on the client
        const currentUrl = window.location.href;
        setEventUrl(currentUrl);
        setQrCodeSrc(generateQrCodeUrl(currentUrl));
    }, []);


   return (
      <Card className="w-full max-w-xs mx-auto bg-card shadow-lg rounded-lg overflow-hidden border border-border">
         <CardHeader className="text-center pb-2">
           <CardTitle className="text-xl font-semibold text-foreground">Scan to Visit</CardTitle>
           <CardDescription className="text-muted-foreground">Scan this code with your phone</CardDescription>
         </CardHeader>
         <CardContent className="flex justify-center items-center p-4">
           {qrCodeSrc && (
              <Image
                // In a real app, use a library like 'qrcode.react' or fetch a generated QR code
                src={qrCodeSrc}
                alt="Onga Village Event QR Code"
                width={200}
                height={200}
                className="rounded-md border border-border p-1 bg-white" // White background for QR code readability
                priority // Load QR code eagerly
              />
            )}
         </CardContent>
      </Card>
   );
}
