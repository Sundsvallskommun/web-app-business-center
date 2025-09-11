'use client';

import { FormBox } from '@components/form/form-box.component';
import { ClientContactSetting } from '@interfaces/contactsettings';
import ContactSettingsFormLogic from '@layouts/pages/mypages-sections/profile/components/contact-settings-form-logic.component';
import { useLocalStorageValue } from '@react-hookz/web';
import { useApi } from '@services/api-service';
import { Accordion, Button, Divider, FormErrorMessage, Icon, Link, Modal, useThemeQueries } from '@sk-web-gui/react';
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
  const { getValues, reset, watch } = methods;
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const email = watch('email');
  const phone = watch('phone');

  const isSaveDisabled = !email && !phone;

  const handleToggleEdit = useCallback(() => {
    if (isEdit) {
      reset();
    }
    setIsEdit(!isEdit);
  }, [isEdit, setIsEdit, reset]);

  const title = isInitial ? 'Välkommen till Mina sidor' : 'Bekräfta kontaktuppgifter';

  const description = isInitial
    ? 'I Mina sidor kan du enkelt följa de ärenden som du har hos Sundsvalls kommun.'
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
          <p>Vi behöver dina kontaktuppgifter för att kunna meddela dig om dina ärenden.</p>
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
          <FormErrorMessage className="text-error">
            {(methods.formState.errors?.[email]?.message as string) ?? ''}
          </FormErrorMessage>
        </div>
      </div>

      <div className="flex items-center">
        <div
          className={`bg-background-color-mixin-2 flex justify-center items-center w-46 h-46 md:h-56 md:w-56 p-10 lg:p-12 rounded-button mr-16`}
        >
          <Icon icon={<Smartphone />} size={56} />
        </div>
        <div className="flex-1 min-w-0">
          <FormBox name="phone" header="Mobilnummer" isEdit={isInitial || isEdit} inputProps={{ placeholder: '+46' }}>
            {isInitial || isEdit ? null : (getValues()?.phone ?? 'Inget mobilnummer tillagt')}
          </FormBox>
          <FormErrorMessage className="text-error">
            {(methods.formState.errors?.[phone]?.message as string) ?? ''}
          </FormErrorMessage>
        </div>
      </div>

      <div>
        <Divider className="py-0 my-0" />
        <Accordion>
          <Accordion.Item header="Hantering av personuppgifter">
            <p className="pb-16">
              Vi använder din e-postadress och ditt mobilnummer för att kunna skicka viktig information, bekräftelser
              och påminnelser som rör dina ärenden och tjänster. Sundsvalls kommun är personuppgiftsansvarig och
              behandlar dina uppgifter enligt dataskyddsförordningen (GDPR).
            </p>
            <p>
              <Link
                href="https://sundsvall.se/kommun-och-politik/overklaga-beslut-rattssakerhet/behandling-av-personuppgifter"
                target="_blank"
                external
              >
                Läs mer om hur vi hanterar dina personuppgifter
              </Link>
            </p>
          </Accordion.Item>
        </Accordion>
        <Divider className="py-0 my-0" />
      </div>

      <Modal.Footer className="gap-16 flex-col-reverse md:flex-row">
        {isInitial ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Lägg till senare
            </Button>
            <Button disabled={isSaveDisabled} type="submit">
              Spara uppgifter
            </Button>
          </>
        ) : isEdit ? (
          <>
            <Button variant="secondary" onClick={handleToggleEdit}>
              Avbryt
            </Button>
            <Button disabled={isSaveDisabled} type="submit">
              Spara uppgifter
            </Button>
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
    const { isMinDesktop } = useThemeQueries();

  // useEffect(() => {
  //   if (!isOpen) return;

  //   const scrollY = window.scrollY;
  //   const body = document.body;
  //   const cc = document.getElementsByClassName('sk-cookie-consent-wrapper');
  //   const prevBodyStyle = {
  //     overflow: body.style.overflow,
  //     position: body.style.position,
  //     top: body.style.top,
  //     width: body.style.width,
  //   };

  //   let prevCcStyle = {
  //     overflow: '',
  //     position: '',
  //     zIndex: '',
  //     top: '',
  //     width: '',
  //     display: '',
  //   };

  //   const ccElem = cc[0] as HTMLElement;

  //   if (cc && cc[0]) {
  //     prevCcStyle = {
  //       overflow: ccElem.style.overflow,
  //       position: ccElem.style.position,
  //       zIndex: ccElem.style.zIndex,
  //       top: ccElem.style.top,
  //       width: ccElem.style.width,
  //       display: ccElem.style.display,
  //     };

  //     ccElem.style.overflow = 'hidden';
  //     ccElem.style.position = 'fixed';
  //     ccElem.style.zIndex = '10';
  //         ccElem.style.top = `-${scrollY}px`;
  //   ccElem.style.width = '100%';
  //   ccElem.style.display = 'none';
  //   }

  //   body.style.overflow = 'hidden';
  //   body.style.position = 'fixed';
  //   body.style.top = `-${scrollY}px`;
  //   body.style.width = '100%';

  //   return () => {
  //     body.style.overflow = prevBodyStyle.overflow;
  //     body.style.position = prevBodyStyle.position;
  //     const y = -(parseInt(body.style.top || '0', 10) || 0);
  //     body.style.top = prevBodyStyle.top;
  //     window.scrollTo(0, y);
  //     if (cc && cc[0]) {
  //       ccElem.style.overflow = prevCcStyle.overflow;
  //       ccElem.style.position = prevCcStyle.position;
  //       ccElem.style.zIndex = prevCcStyle.zIndex;
  //       ccElem.style.top = prevCcStyle.top;
  //       ccElem.style.display = prevCcStyle.display;
  //     }
  //   };
  // }, [isOpen]);

  useEffect(() => {
  const cc = document.getElementsByClassName('sk-cookie-consent-wrapper')[0];
  const body = document.body;
  const scrollY = window.scrollY;

  const prevBodyStyle = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
  };

  let prevCcStyle = {
    overflow: '',
    position: '',
    zIndex: '',
    top: '',
    width: '',
    display: '',
  };

  const ccElem = cc as HTMLElement;

  // Om isOpen är true, dölja wrappern och spara tidigare stil
  if (isOpen) {
    if (ccElem && !isMinDesktop) {
      prevCcStyle = {
        overflow: ccElem.style.overflow,
        position: ccElem.style.position,
        zIndex: ccElem.style.zIndex,
        top: ccElem.style.top,
        width: ccElem.style.width,
        display: ccElem.style.display,
      };

      // Döljer elementet och fixar andra stilar
      ccElem.style.display = 'none';  // Döljer cookie consent
      ccElem.style.overflow = 'hidden';
      ccElem.style.position = 'fixed';
      ccElem.style.zIndex = '10';
      ccElem.style.top = `-${scrollY}px`;
      ccElem.style.width = '100%';
    }

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
  }

  return () => {
    // Återställ stilar när isOpen ändras
    body.style.overflow = prevBodyStyle.overflow;
    body.style.position = prevBodyStyle.position;
    body.style.top = prevBodyStyle.top;
    body.style.width = prevBodyStyle.width;
    if (ccElem && !isMinDesktop) {
      ccElem.style.overflow = prevCcStyle.overflow;
      ccElem.style.position = prevCcStyle.position;
      ccElem.style.zIndex = prevCcStyle.zIndex;
      ccElem.style.top = prevCcStyle.top;
      ccElem.style.display = prevCcStyle.display;  // Återställ display
    }
  };
}, [isOpen]); // Lägg till isOpen som beroende

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
    <div>
      <Modal
        // className="sm:mx-auto sm:my-auto sm:bottom-auto sm:relative sm:inline-flex sm:max-w-[720px]
        //          w-full block left-0 bottom-0 fixed rounded-0 rounded-t-cards sm:rounded-b-cards max-h-dvh"
                //  style={{ WebkitOverflowScrolling: 'touch' }}
                className="max-w-[720px]"
        disableCloseOutside={false}
        show={isOpen}
        hideClosebutton
      >
          <ContactSettingsFormLogic onSubmitSuccess={() => setIsOpen(false)} formData={contactSettings}>
            <ContactSettingsConfirmationContent onClose={closeHandler} isInitial={!showedInitial} />
          </ContactSettingsFormLogic>
      </Modal>
    </div>
  );
};
