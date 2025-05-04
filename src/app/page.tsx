import Image from "next/image";
import { QrCodeDisplay } from "@/components/qr-code";
import { MenuList } from "@/components/menu-list";
import { Separator } from "@/components/ui/separator";
import { Leaf } from "lucide-react"; // Import an icon

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 bg-background">
      <div className="w-full max-w-4xl flex flex-col items-center space-y-8">

        {/* Header Section */}
        <header className="text-center space-y-2">
           <Image
              src="https://picsum.photos/seed/onga_logo/150/80" // Placeholder Logo
              alt="Onga Village Logo"
              width={150}
              height={80}
              className="mx-auto rounded-md shadow-sm"
              data-ai-hint="village logo nature"
            />
          <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center gap-2">
             <Leaf className="h-8 w-8 md:h-10 md:w-10 text-secondary" /> Onga Village
          </h1>
          <p className="text-lg text-muted-foreground">Taste the Tradition, Feel the Vibe!</p>
        </header>

        <Separator className="w-1/2 bg-border" />

        {/* Content Section */}
        <div className="w-full flex flex-col md:flex-row items-start justify-center gap-8 md:gap-12">

          {/* Menu Section */}
          <section className="w-full md:flex-1 order-2 md:order-1">
             <MenuList />
          </section>

          {/* QR Code Section */}
           <aside className="w-full md:w-auto order-1 md:order-2 flex justify-center">
             <QrCodeDisplay />
           </aside>

        </div>

         {/* Footer */}
         <footer className="mt-12 text-center text-sm text-muted-foreground">
           © {new Date().getFullYear()} Onga Village. All rights reserved.
         </footer>

      </div>
    </main>
  );
}
