'use client';

import { useAppContext } from '@contexts/app.context';
import { MenuBar } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import NextLink from 'next/link';
import CaseInformation from './information/information.component';
import CaseMeddelanden from './meddelanden/meddelanden.component';

export enum CaseCurrentTab {
  UPPGIFTER,
  MEDDELANDEN,
}

export default function CaseTabLayout({
  externalCaseId,
  currentTab: _currentTab,
}: {
  externalCaseId: number;
  currentTab: string;
}) {
  const { representingMode } = useAppContext();
  const currentTab = _currentTab
    ? Object.keys(CaseCurrentTab)
        .filter((key) => isNaN(Number(key)))
        .indexOf(_currentTab[0].toUpperCase())
    : CaseCurrentTab.UPPGIFTER; /** default tab */

  return (
    <div>
      <MenuBar current={currentTab} showBackground>
        <MenuBar.Item tabIndex={CaseCurrentTab.UPPGIFTER}>
          <NextLink href={`${getRepresentingModeRoute(representingMode)}/arenden/${externalCaseId}/uppgifter`}>
            Uppgifter
          </NextLink>
        </MenuBar.Item>
        <MenuBar.Item tabIndex={CaseCurrentTab.MEDDELANDEN}>
          <NextLink href={`${getRepresentingModeRoute(representingMode)}/arenden/${externalCaseId}/meddelanden`}>
            Meddelanden
          </NextLink>
        </MenuBar.Item>
      </MenuBar>
      <div className="mt-40">
        {currentTab === CaseCurrentTab.UPPGIFTER ? (
          <CaseInformation />
        ) : currentTab === CaseCurrentTab.MEDDELANDEN ? (
          <CaseMeddelanden />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
