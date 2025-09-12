'use client';

import { Disclosure, Divider } from '@sk-web-gui/react';
import { ContactDetails } from './profile-contact-details.component';
import { ContactSettings } from './profile-contact-settings.component';

export const Profile = () => {
  return (
    <div className="flex flex-col gap-20 md:gap-40">
      <h1 className="mb-0">Din profil och inställningar</h1>

      <Disclosure
        className="bg-background-content rounded-cards shadow-50 md:py-16 py-16 px-24"
        data-cy="contact-information-disclosure"
        header={
          <>
            <h4 className="text-h4-md">Kontaktuppgifter</h4>
            <p className="sm:text-base font-normal mb-0 text-small">
              Här kan du uppdatera dina kontaktuppgifter.
            </p>
          </>
        }
      >
        <Divider strong className="-ml-24 -mr-68"/>
        <ContactDetails />
      </Disclosure>

      <Disclosure
        className="bg-background-content rounded-cards shadow-50 md:py-16 py-16 px-24"
        data-cy="notifications-disclosure"
        header={
          <>
            <h4 className="text-h4-md">Aviseringar</h4>
            <p className="sm:text-base font-normal mb-0 text-small">
              Här väljer hur du ska bli notifierad när något händer kring ditt ärende.
            </p>
          </>
        }
      >
        <Divider strong className="-ml-24 -mr-68"/>
        <ContactSettings />
      </Disclosure>
    </div>
  );
};
