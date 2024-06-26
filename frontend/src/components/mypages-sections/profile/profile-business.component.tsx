import { Divider, Icon } from '@sk-web-gui/react';
import _ from 'lodash';
import { RepresentingEntity, RepresentingMode } from '../../../interfaces/app';
import { useApi } from '../../../services/api-service';
import ContentCard from '../../content-card/content-card';
import { ContactDetailContentBox } from './components/contact-detail-content-box.component';

export const ProfileBusiness = () => {
  const { data: representingEntity } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });

  if (representingEntity?.mode === RepresentingMode.BUSINESS) {
    return (
      <ContentCard>
        <h1 className="text-h3 flex items-center gap-md">
          <Icon size={32} name="user-round" />
          <span>Kontaktuppgifter</span>
        </h1>
        <Divider className="my-lg" />
        <div className="flex flex-wrap gap-x-[12rem] gap-y-40">
          <ContactDetailContentBox header="Namn">
            <div>{representingEntity?.BUSINESS?.organizationName}</div>
          </ContactDetailContentBox>
          <ContactDetailContentBox header="Adress">
            <div>
              {representingEntity?.BUSINESS?.information?.companyLocation?.address?.street && (
                <div>
                  <span>
                    {_.capitalize(representingEntity?.BUSINESS?.information?.companyLocation?.address?.street)}
                  </span>
                  {', '}
                  <span>{representingEntity?.BUSINESS?.information?.companyLocation?.address?.postcode}</span>{' '}
                  <span>{_.capitalize(representingEntity?.BUSINESS?.information?.companyLocation?.address?.city)}</span>
                </div>
              )}
            </div>
          </ContactDetailContentBox>
        </div>
      </ContentCard>
    );
  } else {
    return (
      <ContentCard>
        <h1 className="text-h3 flex items-center gap-md">
          <Icon size={32} name="user-round" />
          <span>Kontaktuppgifter</span>
        </h1>
        <Divider className="my-lg" />
        <div className="flex flex-wrap gap-x-[12rem] gap-y-40">
          <ContactDetailContentBox header="Namn">
            <div>{representingEntity?.PRIVATE?.name}</div>
          </ContactDetailContentBox>
        </div>
      </ContentCard>
    );
  }
};
