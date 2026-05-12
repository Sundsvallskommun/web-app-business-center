'use client';

import { Disclosure, Divider } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@contexts/app.context';
import { ContactDetails } from './profile-contact-details.component';
import { ContactSettings } from './profile-contact-settings.component';
import { Mandates } from './components/mandates/mandates.component';
import { useMandates } from '@services/featureflag-service';

export const Profile = () => {
  const { t } = useTranslation(['profile', 'notifications']);
  const { isRepresentingModeBusiness } = useAppContext();

  return (
    <div className="flex flex-col gap-20 md:gap-40">
      <h1 className="mb-0">{t('profile:title')}</h1>

      <Disclosure
        className="bg-background-content rounded-cards shadow-50 md:py-16 py-16 px-24"
        data-cy="contact-information-disclosure"
      >
        <Disclosure.Header>
          <>
            <div className="flex flex-col">
              <h4 className="text-h4-md">{t('profile:contactSetting.title')}</h4>
              <p className="sm:text-base font-normal mb-0 text-small">{t('profile:contactSetting.description')}</p>
            </div>
            <Disclosure.Button />
          </>
        </Disclosure.Header>
        <Disclosure.Content>
          <Divider strong className="-ml-24 -mr-68" />
          <ContactDetails />
        </Disclosure.Content>
      </Disclosure>

      <Disclosure
        className="bg-background-content rounded-cards shadow-50 md:py-16 py-16 px-24"
        data-cy="notifications-disclosure"
      >
        <Disclosure.Header>
          <>
            <div className="flex flex-col">
              <h4 className="text-h4-md">{t('notifications:title')}</h4>
              <p className="sm:text-base font-normal mb-0 text-small">{t('notifications:description')}</p>
            </div>
            <Disclosure.Button />
          </>
        </Disclosure.Header>
        <Disclosure.Content>
          <Divider strong className="-ml-24 -mr-68" />
          <ContactSettings />
        </Disclosure.Content>
      </Disclosure>

      {useMandates && isRepresentingModeBusiness && <Mandates />}
    </div>
  );
};
