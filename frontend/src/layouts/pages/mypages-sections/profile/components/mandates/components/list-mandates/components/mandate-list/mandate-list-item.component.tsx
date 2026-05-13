import { MandatePopulated } from 'src/data-contracts/backend/data-contracts';
import { apiService, useApi } from '@services/api-service';
import { Button, Icon, Label, useConfirm, useSnackbar } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MandateListStatusIcon } from './mandate-list-statusicon.component';

interface MandateListItemProps {
  mandate: MandatePopulated;
}

export const MandateListItem: React.FC<MandateListItemProps> = ({ mandate }) => {
  const { t } = useTranslation();
  const { showConfirmation } = useConfirm();
  const message = useSnackbar();
  const { refetch } = useApi<MandatePopulated[]>({ url: '/mandates/org', method: 'get' });

  const deleteItem = () => {
    showConfirmation(
      t('profile:mandates.deleteMandateFor', { name: mandate.grantee.name }),
      t('profile:mandates.deleteMandateInfo', { name: mandate.grantee.name }),
      t('profile:mandates.deleteMandate'),
      t('profile:cancel'),
      'error'
    ).then((confirm) => {
      if (confirm) {
        apiService
          .delete(`/mandates/${mandate.id}`)
          .then(() => {
            message({ message: t('profile:mandates.success.delete'), status: 'success' });
            refetch();
          })
          .catch(() => {
            message({ message: t('profile:mandates.errors.delete'), status: 'error' });
          });
      }
    });
  };

  return (
    <li className="bg-background-color-mixin-1 p-16 flex gap-32 rounded-16 items-center">
      <div className="flex flex-col gap-6 grow">
        <label className="text-large">
          {mandate.grantee.name}, {mandate.grantee.personNumber}
        </label>
        <span className="text-dark-secondary">
          {t('profile:mandates.signedBy', {
            name: mandate.grantor.name,
            date: dayjs(mandate.created).format('D MMM YYYY'),
          })}
        </span>
        <span className="text-dark-secondary">
          {t('profile:mandates.validUntil')}: {dayjs(mandate.activeFrom).format('D MMM YYYY')} –{' '}
          {dayjs(mandate.inactiveAfter).format('D MMM YYYY')}
        </span>
      </div>
      <div className="flex justify-end">
        {mandate.status === 'ACTIVE' ? (
          <Button
            data-cy="mandate-list-delete.button"
            leftIcon={<Icon icon={<Trash />} />}
            color="error"
            inverted
            onClick={() => deleteItem()}
          >
            {t('profile:mandates.deleteMandate')}
          </Button>
        ) : (
          <Label inverted rounded data-cy="mandate-list-inactive-label">
            {<Icon size="1.6rem" icon={<MandateListStatusIcon status={mandate.status} />} />}
            {t(`profile:mandates.properties.status.${mandate.status}`, {
              defaultValue: t('profile:mandates.properties.status.INACTIVE'),
            })}
          </Label>
        )}
      </div>
    </li>
  );
};
