import CaseInformation from '@components/mypages-sections/cases/case/information.component';
import CaseMeddelanden from '@components/mypages-sections/cases/case/meddelanden.component';
import { useAppContext } from '@contexts/app.context';
import { MenuBar } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import NextLink from 'next/link';

export enum CaseCurrentTab {
  INFORMATION,
  MEDDELANDEN,
}

export default function CaseTabLayout({ caseId, currentTab: _currentTab }: { caseId: number; currentTab: string }) {
  const { representingMode } = useAppContext();
  const currentTab = _currentTab
    ? Object.keys(CaseCurrentTab)
        .filter((key) => isNaN(Number(key)))
        .indexOf(_currentTab[0].toUpperCase())
    : CaseCurrentTab.INFORMATION; /** default tab */

  return (
    <div>
      <MenuBar current={currentTab} showBackground>
        <MenuBar.Item tabIndex={CaseCurrentTab.INFORMATION}>
          <NextLink href={`${getRepresentingModeRoute(representingMode)}/arenden/${caseId}/information`}>
            Information
          </NextLink>
        </MenuBar.Item>
        <MenuBar.Item tabIndex={CaseCurrentTab.MEDDELANDEN}>
          <NextLink href={`${getRepresentingModeRoute(representingMode)}/arenden/${caseId}/meddelanden`}>
            Meddelanden
          </NextLink>
        </MenuBar.Item>
      </MenuBar>
      <div className="mt-40">
        {currentTab === CaseCurrentTab.INFORMATION ? (
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
