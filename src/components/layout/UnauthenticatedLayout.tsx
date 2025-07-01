import React from 'react';
// import Navbar from './Navbar'; // No longer directly used here
// import Footer from './Footer'; // No longer directly used here

interface UnauthenticatedLayoutProps {
  children: React.ReactNode;
}

const UnauthenticatedLayout: React.FC<UnauthenticatedLayoutProps> = ({ children }) => {
  // The Navbar and Footer are now provided by MainLayout in RootLayout.
  // This component can simply return its children, or provide a specific structure
  // for the content area of unauthenticated pages if needed.
  // For now, let's assume the <main> tag from MainLayout (in RootLayout) is sufficient.
  // If unauthenticated pages need a different <main> styling than authenticated ones,
  // this component could render its own <main> tag with those specific styles.
  return <>{children}</>;
};

export default UnauthenticatedLayout; 