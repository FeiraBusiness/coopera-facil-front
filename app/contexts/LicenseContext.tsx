'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LicenseContextType {
  isProcessCompleted: boolean;
  setIsProcessCompleted: (value: boolean) => void;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: ReactNode }) {
  // Mock: Em produção, buscar do backend
  const [isProcessCompleted, setIsProcessCompleted] = useState(true);

  return (
    <LicenseContext.Provider value={{ isProcessCompleted, setIsProcessCompleted }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}
