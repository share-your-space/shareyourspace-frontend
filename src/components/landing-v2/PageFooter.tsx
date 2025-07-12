
import React from 'react';

const PageFooter = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-y-10 px-8 sm:px-12">
        <div className="space-y-4 text-xs text-gray-800">
          <h5 className="font-bold">ABOUT</h5>
          <p>How ShareYourSpace works</p>
          <p>Newsroom</p>
          <p>Investors</p>
          <p>ShareYourSpace Plus</p>
          <p>ShareYourSpace Luxe</p>
        </div>

        <div className="space-y-4 text-xs text-gray-800">
          <h5 className="font-bold">COMMUNITY</h5>
          <p>Accessibility</p>
          <p>This is not a real site</p>
          <p>Its a pretty awesome clone</p>
          <p>Referrals accepted</p>
          <p>ShareYourSpace.org</p>
        </div>

        <div className="space-y-4 text-xs text-gray-800">
          <h5 className="font-bold">HOST</h5>
          <p>Share your space</p>
          <p>Hosting resources</p>
          <p>Community forum</p>
          <p>Hosting responsibly</p>
        </div>

        <div className="space-y-4 text-xs text-gray-800">
          <h5 className="font-bold">SUPPORT</h5>
          <p>Help Center</p>
          <p>Trust & Safety</p>
          <p>Cancellation options</p>
          <p>Neighborhood support</p>
        </div>
      </div>
      <div className="border-t mt-8 pt-4 text-center text-xs text-gray-500">
        <p>© 2025 ShareYourSpace. All rights reserved. This is a demo site.</p>
        <p>Privacy · Terms · Sitemap</p>
      </div>
    </footer>
  );
};

export default PageFooter;
