import { Button, Divider, Icon } from '@sk-web-gui/react';
import _ from 'lodash';
import { ClientContactSetting } from '../../../interfaces/contactsettings';
import { useApi } from '../../../services/api-service';
import ContentCard from '../../content-card/content-card';
import { ContactDetailContentBox } from './components/contact-detail-content-box.component';

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
  return (
    <ContentCard>
      <h1 className="text-h3 flex items-center gap-md">
        <Icon size={32} name="user-round" />
        <span>Kontaktuppgifter</span>
      </h1>
      <Divider className="my-lg" />
      <div className="flex flex-wrap gap-x-[12rem] gap-y-40">
        <ContactDetailContentBox header="Namn">
          <div>{contactsettings?.name ?? EmptyField('Inget namn tillagt')}</div>
        </ContactDetailContentBox>
        <ContactDetailContentBox header="Adress">
          <div>{getAddress(contactsettings?.address) ?? EmptyField('Ingen address tillagd')}</div>
        </ContactDetailContentBox>
        <ContactDetailContentBox header="E-post">
          <div>{contactsettings?.email ?? EmptyField('Ingen epost-address tillagd')}</div>
        </ContactDetailContentBox>
        <ContactDetailContentBox header="Telefonnummer">
          {contactsettings?.phone ?? EmptyField('Inget telefonnummer tillagt')}
        </ContactDetailContentBox>
      </div>
      <div className="mt-56">
        <Button color="vattjom">Redigera Kontaktuppgifter</Button>
      </div>
    </ContentCard>
  );
};
