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
import { useTranslation } from 'react-i18next';

interface ContactSettingsConfirmationContentProps {
  isInitial: boolean;
  onClose: () => void;
}

const RENEWAL_INTERVAL = 1000 * 60 * 60 * 24 * 365;

const ContactSettingsConfirmationContent: React.FC<ContactSettingsConfirmationContentProps> = ({
  isInitial,
  onClose,
}) => {
  const { t } = useTranslation('confirmation');
  const methods = useFormContext();
  const { getValues, reset } = methods;
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const handleToggleEdit = useCallback(() => {
    if (isEdit) {
      reset();
    }
    setIsEdit(!isEdit);
  }, [isEdit, setIsEdit, reset]);

  const title = isInitial ? t('confirmation:welcomeTitle') : t('confirmation:confirmTitle');

  const description = isInitial ? t('confirmation:welcomeDescription') : t('confirmation:confirmDescription');

  return (
    <Modal.Content className="px-0 lg:px-56 gap-32 md:gap-30">
      <div>
        <h1 className="pb-8">{title}</h1>
        <p className="text-[18px]">{description}</p>
      </div>

      <Divider />

      {isInitial ? (
        <div>
          <h2 className="!text-[18px]">{t('confirmation:addContactInfo')}</h2>
          <p>{t('confirmation:confirmDescription')}</p>
        </div>
      ) : null}

      <div className="flex items-center">
        <div
          className={`bg-background-color-mixin-2 flex justify-center items-center w-46 h-46 md:h-56 md:w-56 p-10 lg:p-12 rounded-button mr-16`}
        >
          <Icon icon={<Mail />} size={56} />
        </div>
        <div className="flex-1 min-w-0">
          <FormBox name="email" header={t('confirmation:emailLabel')} isEdit={isInitial || isEdit}>
            {isInitial || isEdit ? null : (getValues()?.email ?? t('confirmation:noEmail'))}
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
          <FormBox name="phone" header={t('confirmation:phoneLabel')} isEdit={isInitial || isEdit}>
            {isInitial || isEdit ? null : (getValues()?.phone ?? t('confirmation:noPhone'))}
          </FormBox>
        </div>
      </div>

      <div>
        <Divider className="py-0 my-0" />
        <Disclosure>
          <Disclosure.Header>
            <Disclosure.Title>{t('confirmation:personalDataTitle')}</Disclosure.Title>
            <Disclosure.Button />
          </Disclosure.Header>
          <Disclosure.Content>
            <p className="pb-16">{t('confirmation:gdprText')}</p>
            <p>
              <Link
                href="https://sundsvall.se/kommun-och-politik/overklaga-beslut-rattssakerhet/behandling-av-personuppgifter"
                target="_blank"
                external
              >
                {t('confirmation:personalDataLink')}
              </Link>
            </p>
          </Disclosure.Content>
        </Disclosure>
        <Divider className="py-0 my-0" />
      </div>

      <Modal.Footer className="gap-16 flex-col-reverse md:flex-row">
        {isInitial ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              {t('confirmation:addLater')}
            </Button>
            <Button type="submit">{t('confirmation:save')}</Button>
          </>
        ) : isEdit ? (
          <>
            <Button variant="secondary" onClick={handleToggleEdit}>
              {t('confirmation:cancel')}
            </Button>
            <Button type="submit">{t('confirmation:save')}</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={handleToggleEdit}>
              {t('confirmation:noChange')}
            </Button>
            <Button type="submit" onClick={onClose}>
              {t('confirmation:yesConfirm')}
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
    const getCookie = (name: string) => {
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
