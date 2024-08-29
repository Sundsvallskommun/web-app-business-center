'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { RepresentingMode } from '../interfaces/app';
import { newRepresentingModePathname } from '../utils/representingModeRoute';
import { appURL } from '../utils/app-url';
import { useRepresentingSwitch } from '../layouts/site-menu/site-menu-items';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [representingMode, setRepresentingMode] = useState<RepresentingMode>(defaults.representingMode);

  const { setRepresenting } = useRepresentingSwitch();

  const switchRepresentingMode = async (newMode: RepresentingMode) => {
    await setRepresenting({ mode: newMode });
    const pathname = newRepresentingModePathname(newMode);
    router.push(`${appURL()}${pathname}`);
  };

  const resetContextDefaults = () => {
    setRepresentingMode(defaults.representingMode);
  };

  useEffect(() => {
    if (mounted) {
      switchRepresentingMode(representingMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [representingMode]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
