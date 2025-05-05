
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DuplicateErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-br from-red-50 to-yellow-50">
      <Card className="w-full max-w-lg bg-card shadow-xl rounded-lg border border-destructive">
        <CardHeader className="text-center bg-red-100 p-6 rounded-t-lg">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-red-800">Submission Already Exists</CardTitle>
          <CardDescription className="text-red-700 mt-2 text-lg">
            The phone number you entered has already been used to make a selection.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-6">
          <p className="text-muted-foreground">
            Only one food selection is allowed per phone number to ensure everyone gets a chance to enjoy the feast.
          </p>
          <p className="text-muted-foreground">
            If you believe this is an error, please contact the event organizers.
          </p>
          <div className="mt-8">
            <Link href="/" passHref>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Return to Selection Page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
