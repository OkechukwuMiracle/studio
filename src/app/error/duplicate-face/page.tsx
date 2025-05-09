
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DuplicateFaceErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-br from-red-50 to-yellow-50">
      <Card className="w-full max-w-lg bg-card shadow-xl rounded-lg border border-destructive">
        <CardHeader className="text-center bg-red-100 p-6 rounded-t-lg">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-red-800">Face Verification Error</CardTitle>
          <CardDescription className="text-red-700 mt-2 text-lg">
            The face scan provided is already associated with a different phone number that has made a selection.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-6">
          <p className="text-muted-foreground">
            To ensure fairness, each individual can only make one selection, even with a different phone number.
            If you believe this is an error, please contact event staff.
          </p>
          <div className="mt-8">
            <Link href="/menulist" passHref>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 mr-2">
                Try Again
              </Button>
            </Link>
            <Link href="/" passHref>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Return to Welcome Page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

    