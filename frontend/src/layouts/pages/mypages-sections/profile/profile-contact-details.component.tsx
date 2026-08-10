'use client';

import { Button, Divider, Icon, Link } from '@sk-web-gui/react';
import _ from 'lodash';
import { Info, Pen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactSettingsFormLogic from './components/contact-settings-form-logic.component';
import { ClientContactSetting } from '@interfaces/contactsettings';
import { useApi, useApiService } from '@services/api-service';
import { FormBox } from '@components/form/form-box.component';

const EmptyField = (text: string) => {
  return <span className="italic">{text}</span>;
};

const getAddress = (address: { street?: string; postcode?: string; city?: string } | null | undefined) => {
  if (address) {
    return `${address.street ? `${_.capitalize(address.street)}, ` : ''}${address.postcode} ${_.capitalize(address.city)}`;
  } else {
    return null;
  }
};

export const ContactDetails = () => {
  const { t } = useTranslation('profile');
  const queryClient = useApiService((s) => s.queryClient);
  const {
    data: contactsettings,
    isError,
    refetch,
  } = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'get',
    queryKey: ['contactsetting'],
  });
  const [isEditPhone, setIsEditPhone] = useState<boolean>(false);
  const [isEditEmail, setIsEditEmail] = useState<boolean>(false);

  const fetchLatestData = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error fetching contactsettings:', error);
    }
  };

  useEffect(() => {
    if (isError) {
      queryClient.setQueryData(['contactsetting'], []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const setIsEditFalse = () => {
    setIsEditPhone(false);
    setIsEditEmail(false);
  };

  return (
    <div className="pt-40 px-16">
      <div className="flex items-start max-w-fit mb-40 gap-12 ">
        <Icon icon={<Info />} className="shrink-0" />
        <span>
          {t('profile:contactDetails.infoText')}{' '}
          <Link href={t('profile:contactSetting.taxAgencyUrl')} external>
            {t('profile:contactDetails.skatteverketLink')}
          </Link>
        </span>
      </div>

      <ContactSettingsFormLogic onSubmitSuccess={() => setIsEditFalse()} formData={contactsettings}>
        <>
          <FormBox header={t('profile:contactDetails.name')}>
            <div data-cy="form-box-name">
              {contactsettings?.name ?? EmptyField(t('profile:contactDetails.noName'))}
            </div>{' '}
          </FormBox>
          <Divider className="my-16" />
          <FormBox header={t('profile:contactDetails.address')}>
            <div data-cy="form-box-address">
              {getAddress(contactsettings?.address) ?? EmptyField(t('profile:contactDetails.noAddress'))}
            </div>
          </FormBox>
          <Divider className="my-16" />

          <FormBox
            name="email"
            header={isEditEmail ? t('profile:contactDetails.changeEmail') : t('profile:contactDetails.emailAddress')}
            isEdit={isEditEmail}
          >
            {isEditEmail ? (
              <div className="flex gap-16 mt-16">
                <Button variant="secondary" data-cy="cancel-edit-email-button" onClick={() => setIsEditEmail(false)}>
                  {t('profile:contactDetails.cancel')}
                </Button>
                <Button type="submit" data-cy="save-email-button">
                  {t('profile:contactDetails.save')}
                </Button>
              </div>
            ) : (
              <>
                <div data-cy="form-box-email">
                  {contactsettings?.email ? contactsettings.email : EmptyField(t('profile:contactDetails.noEmail'))}
                </div>
                <Button
                  size="md"
                  variant="secondary"
                  leftIcon={<Icon icon={<Pen />} />}
                  onClick={() => {
                    setIsEditEmail(true);
                    fetchLatestData();
                  }}
                  className="mt-32"
                  data-cy="edit-email-button"
                >
                  {t('profile:contactDetails.changeEmail')}
                </Button>
              </>
            )}
          </FormBox>
          <Divider className="my-16" />

          <FormBox
            name="phone"
            header={isEditPhone ? t('profile:contactDetails.changePhone') : t('profile:contactDetails.phoneNumber')}
            isEdit={isEditPhone}
          >
            {isEditPhone ? (
              <div className="flex gap-16 mt-16">
                <Button variant="secondary" data-cy="cancel-edit-phone-button" onClick={() => setIsEditPhone(false)}>
                  {t('profile:contactDetails.cancel')}
                </Button>
                <Button type="submit" data-cy="save-phone-button">
                  {t('profile:contactDetails.save')}
                </Button>
              </div>
            ) : (
              <>
                <div data-cy="form-box-phone">
                  {contactsettings?.phone ? contactsettings.phone : EmptyField(t('profile:contactDetails.noPhone'))}
                </div>
                <Button
                  size="md"
                  variant="secondary"
                  leftIcon={<Icon icon={<Pen />} />}
                  onClick={() => {
                    setIsEditPhone(true);
                    fetchLatestData();
                  }}
                  className="mt-32"
                  data-cy="edit-phone-button"
                >
                  {t('profile:contactDetails.changePhone')}
                </Button>
              </>
            )}
          </FormBox>
        </>
      </ContactSettingsFormLogic>
    </div>
  );
};
