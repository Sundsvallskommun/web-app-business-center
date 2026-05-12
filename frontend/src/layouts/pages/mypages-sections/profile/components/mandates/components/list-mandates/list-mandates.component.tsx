import { MandatePopulated } from 'src/data-contracts/backend/data-contracts';
import { useApi } from '@services/api-service';
import { MandateList } from './components/mandate-list/mandate-list.component';
import { useTranslation } from 'react-i18next';

export const ListMandates: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useApi<MandatePopulated[]>({ url: '/mandates/org', method: 'get' });

  return (
    <div className="flex flex-col gap-56 pt-40">
      <MandateList
        data-cy="list-mandate-active"
        mandates={data?.filter((mandate) => mandate.status === 'ACTIVE')}
        title={t('profile:mandates.activeMandates')}
        description={t('profile:mandates.activeMandatesDescription')}
      />
      <MandateList
        data-cy="list-mandate-inactive"
        mandates={data?.filter((mandate) => mandate.status !== 'ACTIVE')}
        title={t('profile:mandates.inactiveMandates')}
        description={t('profile:mandates.inactiveMandatesDescription')}
      />
    </div>
  );
};
