import { useContext } from 'react';
import { AssetsContext } from '../asset-layout.component';
import dayjs from 'dayjs';
import { Button, Icon } from '@sk-web-gui/react';
import { ArrowRight, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ParkingPermitRenewalAlert({
  setIsEditing,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<null | 'PERMIT_RENEWAL' | 'LOST_PERMIT'>>;
}) {
  const { t } = useTranslation('decisions');
  const { assetData } = useContext(AssetsContext);

  const prettyEndDate = dayjs(assetData?.validTo).format('D MMMM YYYY');
  const pastTense = dayjs(assetData?.validTo).isBefore(dayjs())
    ? t('decisions:parkingPermit.expired')
    : t('decisions:parkingPermit.expiring');

  return (
    <div className="py-8 pl-14 pr-12 border-1 border-vattjom-surface-primary rounded-12 bg-vattjom-background-100 flex gap-40">
      <div className="flex flex-col desktop:flex-row gap-12">
        <div className="mt-6 mb-0">
          <Icon color="vattjom" icon={<Info />} />
        </div>
        <div>
          <p className="mb-12">
            {t('decisions:parkingPermit.renewal.alertDescription', { pastTense, date: prettyEndDate })}
          </p>
          <Button
            className="w-full desktop:w-auto"
            color="vattjom"
            rightIcon={<ArrowRight />}
            onClick={() => setIsEditing('PERMIT_RENEWAL')}
          >
            {t('decisions:parkingPermit.renewal.extendValidity')}
          </Button>
        </div>
      </div>
    </div>
  );
}
