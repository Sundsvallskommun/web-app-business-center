import { Asset } from '@data-contracts/partyassets/data-contracts';
import { Button, Icon } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ArrowRight, Mail } from 'lucide-react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './todos.module.scss';

interface TodoParkingPermitExpiryProps {
  asset: Asset;
}

export const TodoParkingPermitExpiry = ({ asset }: TodoParkingPermitExpiryProps) => {
  const { t } = useTranslation('overview');

  const expiryDate = dayjs(asset.validTo).format('D MMMM YYYY');
  const isExpired = dayjs(asset?.validTo).isBefore(dayjs());
  const perfectTense = isExpired ? t('overview:todo.parkingPermitExpired') : t('overview:todo.parkingPermitExpiring');
  const pastTense = isExpired ? t('overview:todo.expired') : t('overview:todo.expiring');

  return (
    <div className={styles['todo']}>
      <div className={styles['todo-main']}>
        <div className={styles['todo-type']}>
          <Icon className={styles['todo-type-icon']} icon={<Mail />} />
        </div>
        <div className={styles['todo-content']}>
          <h2 className={styles['todo-content-heading']}>{perfectTense}</h2>
          <p className={styles['todo-content-text']}>
            {t('overview:todo.parkingPermitDescription', { pastTense, date: expiryDate })}
          </p>
        </div>
      </div>
      <div className={styles['todo-action']}>
        <NextLink href={`beslut-och-dokument/${asset.id}`}>
          <Button
            className={styles['todo-action-button']}
            color="vattjom"
            rightIcon={<ArrowRight />}
            aria-label={t('overview:todo.parkingPermitAriaLabel')}
          >
            {t('overview:todo.goToCase')}
          </Button>
        </NextLink>
      </div>
    </div>
  );
};
