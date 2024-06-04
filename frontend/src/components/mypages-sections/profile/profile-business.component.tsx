import { Button, Divider, Icon } from '@sk-web-gui/react';
import { OrganisationInfo } from '../../../interfaces/organisation-info';
import { useApi } from '../../../services/api-service';
import ContentCard from '../../content-card/content-card';
import { ContactDetailContentBox } from './components/contact-detail-content-box.component';
import _ from 'lodash';

export const ProfileBusiness = () => {
  const { data: representingEntity } = useApi<OrganisationInfo>({
    url: '/representing',
    method: 'get',
  });

  return (
    <ContentCard>
      <h1 className="text-h3 flex items-center gap-md">
        <Icon size={32} name="user-round" />
        <span>Kontaktuppgifter</span>
      </h1>
      <Divider className="my-lg" />
      <div className="flex flex-wrap gap-x-[12rem] gap-y-40">
        <ContactDetailContentBox header="Namn">
          <div>{representingEntity?.organizationName}</div>
        </ContactDetailContentBox>
        <ContactDetailContentBox header="Adress">
          <div>
            {representingEntity?.information?.companyLocation?.address?.street && (
              <div>
                <span>{_.capitalize(representingEntity?.information?.companyLocation?.address?.street)}</span>
                {', '}
                <span>{representingEntity?.information?.companyLocation?.address?.postcode}</span>{' '}
                <span>{_.capitalize(representingEntity?.information?.companyLocation?.address?.city)}</span>
              </div>
            )}
          </div>
        </ContactDetailContentBox>
      </div>
    </ContentCard>
  );
};
