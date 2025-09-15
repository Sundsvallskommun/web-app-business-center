'use client';

import { FormBox } from '@components/form/form-box.component';
import { ClientContactSetting } from '@interfaces/contactsettings';
import ContactSettingsFormLogic from '@layouts/pages/mypages-sections/profile/components/contact-settings-form-logic.component';
import { useLocalStorageValue } from '@react-hookz/web';
import { useApi } from '@services/api-service';
import { Button, Disclosure, Divider, Icon, Link, Modal } from '@sk-web-gui/react';
import { Mail, Smartphone } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface ContactSettingsConfirmationContentProps {
  isInitial: boolean;
  onClose: () => void;
}

const RENEWAL_INTERVAL = 1000 * 60 * 60 * 24 * 365;

const ContactSettingsConfirmationContent: React.FC<ContactSettingsConfirmationContentProps> = ({
  isInitial,
  onClose,
}) => {
  const methods = useFormContext();
  const { getValues, reset } = methods;
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const handleToggleEdit = useCallback(() => {
    if (isEdit) {
      reset();
    }
    setIsEdit(!isEdit);
  }, [isEdit, setIsEdit, reset]);

  const title = isInitial ? 'Välkommen till Mina sidor' : 'Bekräfta kontaktuppgifter';

  const description = isInitial
    ? 'På Mina sidor kan du följa dina ärenden som du har hos Sundsvalls kommun.'
    : 'Vi behöver dina kontaktuppgifter för att kunna meddela dig om dina ärenden. Stämmer uppgifterna nedan?';

  return (
    <Modal.Content className="px-0 lg:px-56 gap-32 md:gap-30">
      <div>
        <h1 className="pb-8">{title}</h1>
        <p className="text-[18px]">{description}</p>
      </div>

      <Divider />

      {isInitial ? (
        <div>
          <h2 className="!text-[18px]">Lägg till dina kontaktuppgifter</h2>
          <p>Vi behöver dina kontaktuppgifter för att kunna meddelade om uppdateringar på dina ärenden.</p>
        </div>
      ) : null}

      <div className="flex items-center">
        <div
          className={`bg-background-color-mixin-2 flex justify-center items-center w-46 h-46 md:h-56 md:w-56 p-10 lg:p-12 rounded-button mr-16`}
        >
          <Icon icon={<Mail />} size={56} />
        </div>
        <div className="flex-1 min-w-0">
          <FormBox name="email" header="E-postadress" isEdit={isInitial || isEdit}>
            {isInitial || isEdit ? null : (getValues()?.email ?? 'Ingen e-postadress tillagd')}
          </FormBox>
        </div>
      </div>

      <div className="flex items-center">
        <div
          className={`bg-background-color-mixin-2 flex justify-center items-center w-46 h-46 md:h-56 md:w-56 p-10 lg:p-12 rounded-button mr-16`}
        >
          <Icon icon={<Smartphone />} size={56} />
        </div>
        <div className="flex-1 min-w-0">
          <FormBox name="phone" header="Mobilnummer" isEdit={isInitial || isEdit}>
            {isInitial || isEdit ? null : (getValues()?.phone ?? 'Inget mobilnummer tillagt')}
          </FormBox>
        </div>
      </div>

      <div>
        <Divider className="py-0 my-0" />
        <Disclosure header="Hantering av personuppgifter">
          <p className="pb-16">
            Vi använder din e-postadress och ditt mobilnummer för att kunna skicka viktig information, bekräftelser och
            påminnelser som rör dina ärenden och tjänster. Sundsvalls kommun är personuppgiftsansvarig och behandlar
            dina uppgifter enligt dataskyddsförordningen (GDPR).
          </p>
          <p>
            <Link
              href="https://sundsvall.se/kommun-och-politik/overklaga-beslut-rattssakerhet/behandling-av-personuppgifter"
              target="_blank"
              external
            >
              Information om Personuppgiftshantering (sundsvall.se)
            </Link>
          </p>
        </Disclosure>
        <Divider className="py-0 my-0" />
      </div>

      <Modal.Footer className="gap-16 flex-col-reverse md:flex-row">
        {isInitial ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Lägg till senare
            </Button>
            <Button type="submit">Spara uppgifter</Button>
          </>
        ) : isEdit ? (
          <>
            <Button variant="secondary" onClick={handleToggleEdit}>
              Avbryt
            </Button>
            <Button type="submit">Spara uppgifter</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={handleToggleEdit}>
              Nej, ändra
            </Button>
            <Button type="submit" onClick={onClose}>
              Ja, bekräfta
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal.Content>
  );
};

export const ContactSettingsConfirmation: React.FC = () => {
  const { value: showedInitial, set: setShowedInitial } = useLocalStorageValue('showedInitialContactSettings');
  const [cookieExists, setCookieExists] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const getCookie = (name) => {
      const value = '; ' + document.cookie;
      const parts = value.split('; ' + name + '=');
      if (parts.length === 2) {
        const part = parts.pop();
        return part ? part.split(';').shift() : null;
      }
      return null;
    };

    const checkCookie = () => {
      const cookieValue = getCookie('SKCookieConsent');
      if (cookieValue) {
        setCookieExists(true);
      }
    };
    checkCookie();
    const interval = setInterval(() => {
      const cookieValue = getCookie('SKCookieConsent');
      if (cookieValue) {
        setCookieExists(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const { data: contactSettings, isFetching } = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'get',
    queryKey: ['contactsetting'],
  });

  const closeHandler = () => {
    if (!showedInitial) {
      setShowedInitial(true);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (isFetching) {
      return;
    }

    if ((!showedInitial && !contactSettings?.email && !contactSettings?.phone) || !contactSettings) {
      setIsOpen(true);
      return;
    }

    const modifiedTime = new Date(contactSettings.modified!).getTime();
    const currentTime = new Date().getTime();

    if (currentTime - modifiedTime > RENEWAL_INTERVAL) {
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, contactSettings]);

  return (
    <Modal className="w-full max-w-[720px]" disableCloseOutside={false} show={isOpen && cookieExists} hideClosebutton>
      <ContactSettingsFormLogic onSubmitSuccess={() => setIsOpen(false)} formData={contactSettings}>
        <ContactSettingsConfirmationContent onClose={closeHandler} isInitial={!showedInitial} />
      </ContactSettingsFormLogic>
    </Modal>
  );
};
