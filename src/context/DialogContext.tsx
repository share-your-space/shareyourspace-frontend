'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DialogContextType {
  isSpaceCreateDialogOpen: boolean;
  setSpaceCreateDialogOpen: (isOpen: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [isSpaceCreateDialogOpen, setSpaceCreateDialogOpen] = useState(false);

  return (
    <DialogContext.Provider value={{ isSpaceCreateDialogOpen, setSpaceCreateDialogOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}; 