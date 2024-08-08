import { Button, Icon } from '@sk-web-gui/react';
import _ from 'lodash';
import { useState } from 'react';
import { ClientContactSetting } from '../../../interfaces/contactsettings';
import { useApi } from '../../../services/api-service';
import ContentCard, { ContactDetails, ContentCardBody, ContentCardHeader } from '../../content-card/content-card';
import { FormBox } from '../../form/form-box.component';
import ContactDetailFormLogic from './components/contact-detail-form-logic.component';

const EmptyField = (text: string) => {
  return <span className="italic">{text}</span>;
};

const getAddress = (address) => {
  if (address) {
    return `${_.capitalize(address.street)}, ${address.postcode} ${_.capitalize(address.city)}`;
  } else {
    return null;
  }
};

export const ProfilePrivate = () => {
  const { data: contactsettings } = useApi<ClientContactSetting>({ url: '/contactsettings', method: 'get' });
  const [isEdit, setIsEdit] = useState(false);

  return (
    <ContentCard>
      <ContentCardHeader>
        <h1 className="text-h4-lg mb-0">
          <div className="flex items-center gap-md">
            <span>Kontaktuppgifter</span>
          </div>
        </h1>
        <Button
          size="md"
          variant="tertiary"
          showBackground={false}
          leftIcon={<Icon name={isEdit ? 'x' : 'pen'} />}
          onClick={() => setIsEdit((isEdit) => !isEdit)}
        >
          {isEdit ? 'Avbryt' : 'Redigera'}
        </Button>
      </ContentCardHeader>

      <ContentCardBody>
        <ContactDetailFormLogic formData={{ email: contactsettings?.email ?? '', phone: contactsettings?.phone ?? '' }}>
          <ContactDetails>
            <FormBox header="Namn">
              <div>{contactsettings?.name ?? EmptyField('Inget namn tillagt')}</div>{' '}
            </FormBox>
            <FormBox header="Adress">
              <div>{getAddress(contactsettings?.address) ?? EmptyField('Ingen address tillagd')}</div>
            </FormBox>
            <FormBox name="email" header="E-post" isEdit={isEdit}>
              <div>{contactsettings?.email ?? EmptyField('Ingen epost-address tillagd')}</div>
            </FormBox>
            <FormBox name="phone" header="Telefonnummer" isEdit={isEdit}>
              <div>{contactsettings?.phone ?? EmptyField('Inget telefonnummer tillagt')}</div>
            </FormBox>
          </ContactDetails>

          {isEdit && (
            <div className="mt-56">
              <Button type="submit" color="vattjom">
                Spara
              </Button>
            </div>
          )}
        </ContactDetailFormLogic>
      </ContentCardBody>
    </ContentCard>
  );
};
