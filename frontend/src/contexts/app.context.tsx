'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { RepresentingMode } from '../interfaces/app';
import { useRepresentingSwitch } from '../layouts/site-menu/site-menu-items';
import { appURL } from '../utils/app-url';
import {
  getRepresentingMode,
  isBusinessMode,
  isPrivateMode,
  newRepresentingModePathname,
} from '../utils/representingModeRoute';

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

export const DEFAULT_REPRESENTING_MODE: RepresentingMode = RepresentingMode.PRIVATE;

export const defaults: AppContextStates = {
  representingMode: DEFAULT_REPRESENTING_MODE,
  isRepresentingModeBusiness: isBusinessMode(DEFAULT_REPRESENTING_MODE),
  isRepresentingModePrivate: isPrivateMode(DEFAULT_REPRESENTING_MODE),
};

export function AppWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const { setRepresenting } = useRepresentingSwitch();

  const [representingMode, setRepresentingMode] = useState<RepresentingMode>(
    getRepresentingMode(pathname) ?? defaults.representingMode
  );

  const switchRepresentingMode = async (newMode: RepresentingMode) => {
    setRepresenting({ mode: newMode });
    setRepresentingMode(newMode);

    const routeRepresentingMode = getRepresentingMode(pathname);
    if (routeRepresentingMode !== null && routeRepresentingMode !== newMode) {
      const pathname = newRepresentingModePathname(newMode);
      router.push(`${appURL()}${pathname}`);
    }
  };

  const resetContextDefaults = () => {
    setRepresentingMode(defaults.representingMode);
  };

  useEffect(() => {
    const routeRepresentingMode = getRepresentingMode(pathname);
    if (routeRepresentingMode) {
      setRepresentingMode(routeRepresentingMode);
    }
  }, [pathname]);

  return (
    <AppContext.Provider
      value={{
        representingMode,
        setRepresentingMode: (representingMode: RepresentingMode) => switchRepresentingMode(representingMode),
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
