import { Card } from '@components/cards/card.component';
import { Icon } from '@sk-web-gui/react';
import { getOpenEErrandUrl } from '@utils/open-e-errand-url';
import dayjs from 'dayjs';
import { ExternalLink } from 'lucide-react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CaseContext } from '../case-layout.component';

export default function CaseInformation() {
  const { t } = useTranslation('cases');
  const { caseData } = useContext(CaseContext);
  const firstSubmittedValid = !!caseData?.firstSubmitted;
  const openEErrandUrl = getOpenEErrandUrl(caseData);

  return (
    <Card>
      <div className="flex flex-col desktop:flex-row gap-24 desktop:gap-80 flex-wrap">
        <div className="flex flex-col items-start gap-4">
          <div className="font-bold">Ärendenummer</div>
          <div>{caseData?.errandNumber || caseData?.caseId}</div>
        </div>
        <div className="flex flex-col items-start gap-4">
          <div className="font-bold">Registrerat</div>
          <div>{firstSubmittedValid ? dayjs(caseData?.firstSubmitted).format('YYYY-MM-DD HH:mm') : 'Datum saknas'}</div>
        </div>
      </div>
      {openEErrandUrl ? (
        <a
          href={openEErrandUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sk-btn sk-btn-md sk-btn-secondary w-1/3"
          aria-label={t('cases:information.showErrandAriaLabel')}
        >
          {t('cases:information.showErrand')}
          <Icon icon={<ExternalLink />} />
        </a>
      ) : null}
    </Card>
  );
}
