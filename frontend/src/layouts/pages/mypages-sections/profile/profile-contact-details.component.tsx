'use client';

import { Button, Divider, Icon, Link } from '@sk-web-gui/react';
import _ from 'lodash';
import { Info, Pen } from 'lucide-react';
import { useEffect, useState } from 'react';
import ContactSettingsFormLogic from './components/contact-settings-form-logic.component';
import { ClientContactSetting } from '@interfaces/contactsettings';
import { useApi, useApiService } from '@services/api-service';
import { FormBox } from '@components/form/form-box.component';

const EmptyField = (text: string) => {
  return <span className="italic">{text}</span>;
};

const getAddress = (address) => {
  if (address) {
    return `${address.street ? `${_.capitalize(address.street)}, ` : ''}${address.postcode} ${_.capitalize(address.city)}`;
  } else {
    return null;
  }
};

export const ContactDetails = () => {
  const queryClient = useApiService((s) => s.queryClient);
  const { data: contactsettings, isError } = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'get',
    queryKey: ['contactsetting'],
  });
  const [isEditPhone, setIsEditPhone] = useState<boolean>(false);
  const [isEditEmail, setIsEditEmail] = useState<boolean>(false);

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
          Vi hämtar namn och adress från Skatteverket. Stämmer inte uppgifterna kan du ändra dem på{' '}
          <Link href="https://www.skatteverket.se" external>
            Skatteverkets hemsida
          </Link>
        </span>
      </div>

      <ContactSettingsFormLogic onSubmitSuccess={() => setIsEditFalse()} formData={contactsettings}>
        <>
          <FormBox header="Namn">
            <div data-cy="form-box-name">{contactsettings?.name ?? EmptyField('Inget namn tillagt')}</div>{' '}
          </FormBox>
          <Divider className="my-16" />
          <FormBox header="Adress">
            <div data-cy="form-box-address">
              {getAddress(contactsettings?.address) ?? EmptyField('Ingen address tillagd')}
            </div>
          </FormBox>
          <Divider className="my-16" />

          <FormBox name="email" header={isEditEmail ? 'Ändra e-postadress' : 'E-postadress'} isEdit={isEditEmail}>
            {isEditEmail ? (
              <div className="flex gap-16 mt-16">
                <Button variant="secondary" data-cy="cancel-edit-email-button" onClick={() => setIsEditEmail(false)}>
                  Avbryt
                </Button>
                <Button type="submit" data-cy="save-email-button">
                  Spara
                </Button>
              </div>
            ) : (
              <>
                <div data-cy="form-box-email">
                  {contactsettings?.email ? contactsettings.email : EmptyField('Ingen e-postaddress tillagd')}
                </div>
                <Button
                  size="md"
                  variant="secondary"
                  leftIcon={<Icon icon={<Pen />} />}
                  onClick={() => setIsEditEmail(true)}
                  className="mt-32"
                  data-cy="edit-email-button"
                >
                  Ändra e-postadress
                </Button>
              </>
            )}
          </FormBox>
          <Divider className="my-16" />

          <FormBox name="phone" header={isEditPhone ? 'Ändra mobilnummer' : 'Mobilnummer'} isEdit={isEditPhone}>
            {isEditPhone ? (
              <>
                <p className="text-small mt-1">
                  Ange mobilnumret i formatet: <code>+467XXXXXXXX</code>.
                </p>
                <div className="flex gap-16 mt-16">
                  <Button variant="secondary" data-cy="cancel-edit-phone-button" onClick={() => setIsEditPhone(false)}>
                    Avbryt
                  </Button>
                  <Button type="submit" data-cy="save-phone-button">
                    Spara
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div data-cy="form-box-phone">
                  {contactsettings?.phone ? contactsettings.phone : EmptyField('Inget mobilnummer tillagt')}
                </div>
                <Button
                  size="md"
                  variant="secondary"
                  leftIcon={<Icon icon={<Pen />} />}
                  onClick={() => setIsEditPhone(true)}
                  className="mt-32"
                  data-cy="edit-phone-button"
                >
                  Ändra mobilnummer
                </Button>
              </>
            )}
          </FormBox>
        </>
      </ContactSettingsFormLogic>
    </div>
  );
};
