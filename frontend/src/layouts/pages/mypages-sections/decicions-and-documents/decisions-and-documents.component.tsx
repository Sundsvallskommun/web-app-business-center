'use client';

import { useTranslation } from 'react-i18next';
import { useDecisions } from '@services/featureflag-service';
import { Assets } from './assets.component';
import { Decisions } from './decisions.component';

export const DecisionsAndDocuments = () => {
  const { t } = useTranslation('decisions');

  return (
    <div>
      <h1>{t('decisions:title')}</h1>
      <p className="my-0">{t('decisions:description')}</p>
      <p className="my-0">{t('decisions:pendingCaseInfo')}</p>
      <div className="mt-40">
        {useDecisions && <Decisions />}
        <Assets />
      </div>
    </div>
  );
};
