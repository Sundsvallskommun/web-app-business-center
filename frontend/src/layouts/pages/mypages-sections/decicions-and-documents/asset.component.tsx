'use client';

import { Card } from '@components/cards/card.component';
import { getAssetStatusProps, isParkingPermit, soonExpiring } from '@services/asset-service';
import { Button, Divider, Icon, Label } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsContext } from './asset-layout.component';
import ParkingPermitLost from './parkingpermits/parkingpermit-lost.component';
import ParkingPermitRenewalAlert from './parkingpermits/parkingpermit-renewal-alert.component';
import ParkingPermitRenewal from './parkingpermits/parkingpermit-renewal.component';

export default function Asset() {
  const { t } = useTranslation('decisions');
  const [isEditing, setisEditing] = useState<null | 'PERMIT_RENEWAL' | 'LOST_PERMIT'>(null);
  const { assetData } = useContext(AssetsContext);
  const statusProps = getAssetStatusProps(assetData?.status);
  return isEditing === 'PERMIT_RENEWAL' ? (
    <ParkingPermitRenewal setIsEditing={setisEditing} />
  ) : isEditing === 'LOST_PERMIT' ? (
    <ParkingPermitLost setIsEditing={setisEditing} />
  ) : (
    <Card>
      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center">
        <div className="flex gap-x-8 desktop:gap-x-24">
          <div className="list-item-card-content-icon">
            <Icon icon={<FileCheck2 />} />
          </div>
          <h1 className="text-h2-sm desktop:text-h2-lg mb-0 break-word hyphens-auto">{assetData?.description}</h1>
        </div>
        <span>
          <Label rounded inverted color={statusProps.color}>
            {t(statusProps.tKey)}
          </Label>
        </span>
      </div>
      <Divider className="my-0" />
      {assetData && isParkingPermit(assetData) && soonExpiring(assetData) ? (
        <ParkingPermitRenewalAlert setIsEditing={setisEditing} />
      ) : null}
      {assetData && isParkingPermit(assetData) ? (
        <div className="mt-0 w-full desktop:w-auto">
          <Button
            className="w-full desktop:w-auto"
            variant="secondary"
            rightIcon={<ArrowRight />}
            onClick={() => setisEditing('LOST_PERMIT')}
            data-cy="report-lost-permit-button"
          >
            {t('decisions:asset.reportLostPermit')}
          </Button>
        </div>
      ) : null}
      <div className="flex flex-col desktop:flex-row gap-24 desktop:gap-80 flex-wrap">
        {assetData?.assetId ? (
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">{t('decisions:asset.cardNumber')}</div>
            <div>{assetData?.assetId}</div>
          </div>
        ) : null}
        {assetData?.issued ? (
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">{t('decisions:asset.decided')}</div>
            <div>{dayjs(assetData?.issued).format('D MMM YYYY')}</div>
          </div>
        ) : null}
        {assetData?.issued && assetData?.validTo ? (
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">{t('decisions:asset.validityPeriod')}</div>
            <div>{`${dayjs(assetData?.issued).format('D MMM YYYY')} - ${dayjs(assetData?.validTo).format('D MMM YYYY')}`}</div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
