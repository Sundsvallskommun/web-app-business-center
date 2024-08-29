'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { RepresentingEntity, RepresentingMode } from '../interfaces/app';
import { useRepresentingSwitch } from '../layouts/site-menu/site-menu-items';
import { useApi } from '../services/api-service';
import { appURL } from '../utils/app-url';
import { getRepresentingMode, newRepresentingModePathname } from '../utils/representingModeRoute';

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
  representingMode: DEFAULT_REPRESENTING_MODE,
  isRepresentingModeBusiness: DEFAULT_REPRESENTING_MODE === RepresentingMode.BUSINESS,
  isRepresentingModePrivate: DEFAULT_REPRESENTING_MODE !== RepresentingMode.BUSINESS,
};

export function AppWrapper({ children }) {
  const router = useRouter();

  const [representingMode, setRepresentingMode] = useState<RepresentingMode>(defaults.representingMode);

  const { setRepresenting } = useRepresentingSwitch();
  const {
    data: representingEntity,
    isLoading: representingIsLoading,
    isFetching: representingIsFetching,
  } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });

  const switchRepresentingMode = async (newMode: RepresentingMode) => {
    if (newMode !== representingMode) {
      setRepresentingMode(newMode);
      if (newMode !== undefined) {
        if (getRepresentingMode() !== newMode) {
          const pathname = newRepresentingModePathname(newMode);
          router.push(`${appURL()}${pathname}`);
        }
      }
      setRepresenting({ mode: newMode });
    }
  };

  const resetContextDefaults = () => {
    setRepresentingMode(defaults.representingMode);
  };

  useEffect(() => {
    if (!representingIsLoading && !representingIsFetching) {
      if (representingEntity?.mode === undefined) {
        setRepresenting({ mode: defaults.representingMode });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [representingIsLoading, representingIsFetching]);

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
