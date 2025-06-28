import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileWarning } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="container mx-auto max-w-md">
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-center py-8">
        <FileWarning size={100} className="text-primary opacity-80" />

        <h1 className="text-8xl md:text-9xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent my-2">
          404
        </h1>

        <h2 className="text-4xl font-bold mb-2">Page Not Found</h2>

        <p className="max-w-md text-muted-foreground mb-4">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}