import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 mt-auto py-6 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          © {new Date().getFullYear()} ShareYourSpace. All rights reserved.
          <div className="mt-2">
            <Link href="/terms" className="hover:underline mx-2">Terms of Service</Link>
            |
            <Link href="/privacy" className="hover:underline mx-2">Privacy Policy</Link>
            {/* Add other footer links if needed */}
          </div>
        </div>
        {/* Added CTA buttons */}
        <div className="flex justify-center gap-4 mt-4">
           <Button asChild size="sm">
             <Link href="/signup">Sign Up Now</Link>
           </Button>
           <Button asChild variant="outline" size="sm">
             <Link href="#benefits">Learn More</Link>
           </Button>
         </div>
      </div>
    </footer>
  );
};

export default Footer; 