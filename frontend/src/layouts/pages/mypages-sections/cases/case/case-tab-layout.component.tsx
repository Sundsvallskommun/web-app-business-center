'use client';

import { useAppContext } from '@contexts/app.context';
import { Label, Tabs } from '@sk-web-gui/react';
import { getCaseTypeLabel } from '@utils/casetype-label-mapper';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { CaseContext } from './case-layout.component';
import CaseInformation from './information/information.component';
import CaseMeddelanden from './meddelanden/meddelanden.component';
import { ICaseStatusResponse } from '@interfaces/case';

export enum CaseCurrentTab {
  // order must correspond to the <Tabs/> component
  UPPGIFTER = 'uppgifter',
  MEDDELANDEN = 'meddelanden',
}

export default function CaseTabLayout({
  caseId,
  currentTab: _currentTab,
}: {
  caseId: string;
  currentTab: keyof typeof CaseCurrentTab;
}) {
  const currentTabWithDefault = _currentTab ? _currentTab : CaseCurrentTab.UPPGIFTER;
  const { representingMode } = useAppContext();
  const { caseData } = useContext(CaseContext);
  const router = useRouter();

  const handleGotoTab = (tab: string) => {
    router.push(`${getRepresentingModeRoute(representingMode)}/arenden/${caseId}/${tab}`);
  };

  const messageAllowed = (caseData: ICaseStatusResponse | undefined) => caseData?.messagesAllowed === true;

  const requestedTab = Object.keys(CaseCurrentTab).indexOf(currentTabWithDefault.toUpperCase());
  const currentTab = requestedTab > 0 && !messageAllowed(caseData) ? 0 : requestedTab;

  return (
    <div>
      <div className="flex flex-col-reverse desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mb-56">
        <h1 className="text-h2-lg mb-0 break-all">{getCaseTypeLabel(caseData?.caseType)}</h1>
        <span>
          <Label rounded inverted color={caseData?.status.color}>
            {caseData?.status.label}
          </Label>
        </span>
      </div>
      <Tabs current={currentTab}>
        <Tabs.Item>
          <Tabs.Button onClick={() => handleGotoTab(CaseCurrentTab.UPPGIFTER)}>Ärendeuppgifter</Tabs.Button>
          <Tabs.Content>
            <CaseInformation />
          </Tabs.Content>
        </Tabs.Item>
        {messageAllowed(caseData) ? (
          <Tabs.Item>
            <Tabs.Button onClick={() => handleGotoTab(CaseCurrentTab.MEDDELANDEN)}>
              Meddelanden
              {/* TODO: Uncomment when the API supports it
            {caseMessages?.filter((m) => m.direction === 'OUTBOUND' && !messageIsViewed(m))?.length ? (
              <Callout className="-top-2" color="error" />
            ) : null} */}
            </Tabs.Button>
            <Tabs.Content>
              <CaseMeddelanden />
            </Tabs.Content>
          </Tabs.Item>
        ) : null}
      </Tabs>
    </div>
  );
}
