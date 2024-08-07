'use client';

import { OrganisationInfo } from '@interfaces/organisation-info';
import { emptyOrganisationInfo } from '@services/organisation-service';
import { createContext, useContext, useState } from 'react';
import { RepresentingMode } from '../interfaces/app';

export interface AppContextStates {
  representingEntity: OrganisationInfo;
  representingMode: RepresentingMode;
  isRepresentingModeBusiness: boolean;
  isRepresentingModePrivate: boolean;
}

export interface AppContextActions {
  setRepresentingEntity: (entity: any) => void;
  setRepresentingMode: (myPagsMode: RepresentingMode) => void;
  resetContextDefaults: () => void;
}

export interface AppContext extends AppContextStates, AppContextActions {}

// @ts-expect-error
const AppContext = createContext<AppContext>(null);

export const DEFAULT_REPRESENTING_MODE = RepresentingMode.BUSINESS;

export const defaults: AppContextStates = {
  representingEntity: emptyOrganisationInfo,
  representingMode: RepresentingMode.BUSINESS,
  isRepresentingModeBusiness: DEFAULT_REPRESENTING_MODE === RepresentingMode.BUSINESS,
  isRepresentingModePrivate: DEFAULT_REPRESENTING_MODE !== RepresentingMode.BUSINESS,
};

export function AppWrapper({ children }) {
  const [representingEntity, setRepresentingEntity] = useState<OrganisationInfo>(defaults.representingEntity);
  const [representingMode, setRepresentingMode] = useState<RepresentingMode>(defaults.representingMode);

  const resetContextDefaults = () => {
    setRepresentingEntity(defaults.representingEntity);
    setRepresentingMode(defaults.representingMode);
  };

  return (
    <AppContext.Provider
      value={{
        representingEntity,
        setRepresentingEntity: (entity: any) => setRepresentingEntity(entity),
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
