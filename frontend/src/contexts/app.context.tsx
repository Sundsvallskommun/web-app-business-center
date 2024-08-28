'use client';

import { createContext, useContext, useState } from 'react';
import { RepresentingMode } from '../interfaces/app';

export interface AppContextStates {
  representingMode: RepresentingMode;
  isRepresentingModeBusiness: boolean;
  isRepresentingModePrivate: boolean;
}

export interface AppContextActions {
  setRepresentingMode: (myPagsMode: RepresentingMode) => void;
  resetContextDefaults: () => void;
}

export interface AppContext extends AppContextStates, AppContextActions {}

// @ts-expect-error it wont be null upon init because it's set within AppWrapper
const AppContext = createContext<AppContext>(null);

export const DEFAULT_REPRESENTING_MODE = RepresentingMode.BUSINESS;

export const defaults: AppContextStates = {
  representingMode: RepresentingMode.BUSINESS,
  isRepresentingModeBusiness: DEFAULT_REPRESENTING_MODE === RepresentingMode.BUSINESS,
  isRepresentingModePrivate: DEFAULT_REPRESENTING_MODE !== RepresentingMode.BUSINESS,
};

export function AppWrapper({ children }) {
  const [representingMode, setRepresentingMode] = useState<RepresentingMode>(defaults.representingMode);

  const resetContextDefaults = () => {
    setRepresentingMode(defaults.representingMode);
  };

  return (
    <AppContext.Provider
      value={{
        representingMode,
        setRepresentingMode: (representingMode: RepresentingMode) => setRepresentingMode(representingMode),
        isRepresentingModeBusiness: representingMode === RepresentingMode.BUSINESS,
        isRepresentingModePrivate: representingMode === RepresentingMode.PRIVATE,
        resetContextDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
