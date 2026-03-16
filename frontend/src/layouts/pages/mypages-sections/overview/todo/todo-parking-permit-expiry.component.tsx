import { Asset } from '@data-contracts/partyassets/data-contracts';
import { Button, Icon } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ArrowRight, Mail } from 'lucide-react';
import NextLink from 'next/link';
import styles from './todos.module.scss';

interface TodoParkingPermitExpiryProps {
  asset: Asset;
}

export const TodoParkingPermitExpiry = ({ asset }: TodoParkingPermitExpiryProps) => {
  const expiryDate = dayjs(asset.validTo).format('D MMMM YYYY');
  const perfectTense = dayjs(asset?.validTo).isBefore(dayjs()) ? 'har löpt ut' : 'löper ut';
  const pastTense = dayjs(asset?.validTo).isBefore(dayjs()) ? 'löpte ut' : 'löper ut';

  return (
    <div className={styles['todo']}>
      <div className={styles['todo-main']}>
        <div className={styles['todo-type']}>
          <Icon className={styles['todo-type-icon']} icon={<Mail />} />
        </div>
        <div className={styles['todo-content']}>
          <h2 className={styles['todo-content-heading']}>Ditt parkeringstillstånd {perfectTense}</h2>
          <p className={styles['todo-content-text']}>
            Ditt parkeringstillstånd {pastTense} den {expiryDate}. Gå in på tillståndet om du vill förlänga det.
          </p>
        </div>
      </div>
      <div className={styles['todo-action']}>
        <NextLink href={`beslut-och-dokument/${asset.assetId}`}>
          <Button
            className={styles['todo-action-button']}
            color="vattjom"
            rightIcon={<ArrowRight />}
            aria-label="Parkeringstillstånd, till ärendet"
          >
            Till ärendet
          </Button>
        </NextLink>
      </div>
    </div>
  );
};
