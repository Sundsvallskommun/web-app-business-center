'use client';

import { useContext } from 'react';
import { AssetsContext } from './asset-layout.component';
import dayjs from 'dayjs';
import { Divider, Icon, Label } from '@sk-web-gui/react';
import { Card } from '@components/cards/card.component';
import { Status } from '@data-contracts/partyassets/data-contracts';
import { FileCheck2 } from 'lucide-react';

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
  const { assetData } = useContext(AssetsContext);
  return (
    <Card>
      <div className="flex flex-col-reverse desktop:flex-row gap-x-24 gap-y-20 desktop:items-center">
        <div className="list-item-card-content-icon">
          <Icon icon={<FileCheck2 />} />
        </div>
        <h1 className="text-h2-lg mb-0">{assetData?.description}</h1>
        <span>
          <Label rounded inverted color={getAssetProps(assetData?.status).color}>
            {getAssetProps(assetData?.status).name}
          </Label>
        </span>
      </div>
      <Divider className="my-40" />
      <div className="flex flex-col desktop:flex-row gap-24 desktop:gap-80 flex-wrap">
        <div className="flex flex-col items-start gap-4">
          <div className="font-bold">Ärendenummer</div>
          <div>?</div>
        </div>
        <div className="flex flex-col items-start gap-4">
          <div className="font-bold">Kortnummer</div>
          <div>?</div>
        </div>
        <div className="flex flex-col items-start gap-4">
          <div className="font-bold">Beslutad</div>
          <div>{dayjs(assetData?.issued).format('D MMM YYYY')}</div>
        </div>
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
