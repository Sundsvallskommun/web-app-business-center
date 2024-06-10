import { Button, Divider, Icon } from '@sk-web-gui/react';
import ContentCard from '../../content-card/content-card';
import { ContactDetailContentBox } from './components/contact-detail-content-box.component';

export const ProfilePrivate = () => {
  return (
    <ContentCard>
      <h1 className="text-h3 flex items-center gap-md">
        <Icon size={32} name="user-round" />
        <span>Kontaktuppgifter</span>
      </h1>
      <Divider className="my-lg" />
      <div className="flex flex-wrap gap-x-[12rem] gap-y-40">
        <ContactDetailContentBox header="Namn">
          <div>Förnamn Efternamn</div>
        </ContactDetailContentBox>
        <ContactDetailContentBox header="Adress">
          <div>Solumshamn 136, 87166 Sundsvall</div>
        </ContactDetailContentBox>
        <ContactDetailContentBox header="E-post">
          <div>fornamn.efternamn@hotmail.com</div>
        </ContactDetailContentBox>
        <ContactDetailContentBox header="Telefonnummer"></ContactDetailContentBox>
      </div>
      <div className="mt-56">
        <Button color="vattjom">Redigera Kontaktuppgifter</Button>
      </div>
    </ContentCard>
  );
};
