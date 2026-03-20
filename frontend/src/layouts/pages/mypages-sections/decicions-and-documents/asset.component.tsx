'use client';

import { Card } from '@components/cards/card.component';
import { Status } from '@data-contracts/partyassets/data-contracts';
import { isParkingPermit, soonExpiring } from '@services/asset-service';
import { PARKING_PERMIT_ACTIONS_ENABLED } from '@utils/feature-flags';
import { Button, Divider, Icon, Label } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import { useContext, useState } from 'react';
import { AssetsContext } from './asset-layout.component';
import ParkingPermitLost from './parkingpermits/parkingpermit-lost.component';
import ParkingPermitRenewalAlert from './parkingpermits/parkingpermit-renewal-alert.component';
import ParkingPermitRenewal from './parkingpermits/parkingpermit-renewal.component';

const getAssetProps = (status?: Status) => {
  let color: string;
  let name: string;
  switch (status) {
    case 'ACTIVE':
      color = 'success';
      name = 'Aktiv';
      break;
    case 'BLOCKED':
      color = 'error';
      name = 'Blockerad';
      break;
    case 'EXPIRED':
      color = 'error';
      name = 'Utgången';
      break;
    default:
      color = 'primary';
      name = 'Okänd';
  }
  return { color, name };
};

export default function Asset() {
  const [isEditing, setisEditing] = useState<null | 'PERMIT_RENEWAL' | 'LOST_PERMIT'>(null);
  const { assetData } = useContext(AssetsContext);
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
          <Label rounded inverted color={getAssetProps(assetData?.status).color}>
            {getAssetProps(assetData?.status).name}
          </Label>
        </span>
      </div>
      <Divider className="my-0" />
      {PARKING_PERMIT_ACTIONS_ENABLED && assetData && isParkingPermit(assetData) && soonExpiring(assetData) ? (
        <ParkingPermitRenewalAlert setIsEditing={setisEditing} />
      ) : null}
      {PARKING_PERMIT_ACTIONS_ENABLED && assetData && isParkingPermit(assetData) ? (
        <div className="mt-0 w-full desktop:w-auto">
          <Button
            className="w-full desktop:w-auto"
            variant="secondary"
            rightIcon={<ArrowRight />}
            onClick={() => setisEditing('LOST_PERMIT')}
            data-cy="report-lost-permit-button"
          >
            Anmäl borttappat tillstånd
          </Button>
        </div>
      ) : null}
      <div className="flex flex-col desktop:flex-row gap-24 desktop:gap-80 flex-wrap">
        {assetData?.caseReferenceIds?.length ? (
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">Ärendenummer</div>
            <div>
              {assetData?.caseReferenceIds?.map((id) => (
                <div key={id}>{id}</div>
              ))}
            </div>
          </div>
        ) : null}
        {assetData?.assetId ? (
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">Kortnummer</div>
            <div>{assetData?.assetId}</div>
          </div>
        ) : null}
        {assetData?.issued ? (
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">Beslutad</div>
            <div>{dayjs(assetData?.issued).format('D MMM YYYY')}</div>
          </div>
        ) : null}
        {assetData?.issued && assetData?.validTo ? (
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">Giltighetstid</div>
            <div>{`${dayjs(assetData?.issued).format('D MMM YYYY')} - ${dayjs(assetData?.validTo).format('D MMM YYYY')}`}</div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
