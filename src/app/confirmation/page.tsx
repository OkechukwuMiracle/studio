
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Utensils, GlassWater } from 'lucide-react';
import { allMenuItems } from '@/components/menu-list'; // Import all items for lookup

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const foodId = searchParams.get('food');
  const drinkIds = searchParams.getAll('drinks'); // Get all drink IDs

  // Find the full item details using the IDs
  const selectedFood = foodId ? allMenuItems.find(item => item.id === foodId) : null;
  const selectedDrinks = drinkIds.map(id => allMenuItems.find(item => item.id === id)).filter(Boolean) as typeof allMenuItems; // Filter out nulls

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-lg bg-card shadow-xl rounded-lg border border-green-200">
        <CardHeader className="text-center bg-green-100 p-6 rounded-t-lg">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-green-800">Submission Successful!</CardTitle>
          <CardDescription className="text-green-700 mt-2 text-lg">
            Your Onga Village Feast selection has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" /> Your Selected Food:
            </h3>
            {selectedFood ? (
              <p className="text-lg text-muted-foreground pl-7">{selectedFood.name}</p>
            ) : (
              <p className="text-lg text-muted-foreground pl-7 italic">No food item found.</p>
            )}
          </div>

          {selectedDrinks.length > 0 && (
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <GlassWater className="h-5 w-5 text-secondary" /> Your Selected Drinks:
              </h3>
              <ul className="list-disc list-inside pl-7 space-y-1">
                {selectedDrinks.map(drink => (
                  <li key={drink.id} className="text-lg text-muted-foreground">{drink.name}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedDrinks.length === 0 && (
             <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <GlassWater className="h-5 w-5 text-secondary" /> Your Selected Drinks:
                </h3>
                <p className="text-lg text-muted-foreground pl-7 italic">No drinks selected.</p>
              </div>
          )}


          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">Enjoy the feast!</p>
            <Link href="/" passHref>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Back to Selection Page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
