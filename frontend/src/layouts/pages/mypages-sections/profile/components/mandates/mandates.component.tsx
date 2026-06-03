import { useApi } from '@services/api-service';
import { Button, Disclosure, Divider, Icon, List } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateMandateModal } from './components/create-mandate-modal/create-mandate-modal.component';
import { ListMandates } from './components/list-mandates/list-mandates.component';
import { RepresentingEntity } from 'src/data-contracts/backend/data-contracts';

export const Mandates: React.FC = () => {
  const { data: representingEntity } = useApi<RepresentingEntity>({ url: '/representing', method: 'get' });
  const isAuthorized = representingEntity?.BUSINESS?.isAuthorizedSignatory || representingEntity?.BUSINESS?.whitelisted;

  const [showCreate, setShowCreate] = useState(false);
  const { t } = useTranslation();

  return (
    isAuthorized && (
      <Disclosure
        className="bg-background-content rounded-cards shadow-50 md:py-16 py-16 px-24"
        data-cy="mandate-disclosure"
      >
        <Disclosure.Header>
          <>
            <div className="flex flex-col">
              <h4 className="text-h4-md">{t('profile:mandates.title')}</h4>
              <p className="sm:text-base font-normal mb-0 text-small">{t('profile:mandates.description')}</p>
            </div>
            <Disclosure.Button />
          </>
        </Disclosure.Header>
        <Disclosure.Content>
          <Divider strong className="-ml-24 -mr-68" />
          <div className="py-32 px-0">
            {showCreate && <CreateMandateModal open={showCreate} onClose={() => setShowCreate(false)} />}
            <div className="max-w-[80rem]">
              <p>{t('profile:mandates.information')}</p>
              <List listStyle="bullet">
                <List.Item className="p-0 before:!m-0">
                  <List.Text>{t('profile:mandates.bullets.1')}</List.Text>
                </List.Item>
                <List.Item className="p-0 before:!m-0">
                  <List.Text>{t('profile:mandates.bullets.2')}</List.Text>
                </List.Item>
                <List.Item className="p-0 before:!m-0">
                  <List.Text>{t('profile:mandates.bullets.3')}</List.Text>
                </List.Item>
                <List.Item className="p-0 before:!m-0">
                  <List.Text>{t('profile:mandates.bullets.4')}</List.Text>
                </List.Item>
              </List>
            </div>
            <Button
              data-cy="create-mandate-button"
              className="w-fit grow-0 mt-40"
              leftIcon={<Icon icon={<Plus />} />}
              onClick={() => setShowCreate(true)}
            >
              {t('profile:mandates.create_new')}
            </Button>
            <ListMandates />
          </div>
        </Disclosure.Content>
      </Disclosure>
    )
  );
};
