'use client';

import { useCallback, useContext, useMemo } from 'react';
import { AssetsContext } from './asset-layout.component';
import dayjs from 'dayjs';
import { Button, Divider, Icon, Label } from '@sk-web-gui/react';
import { Card } from '@components/cards/card.component';
import { Status } from '@data-contracts/partyassets/data-contracts';
import { File, FileCheck2 } from 'lucide-react';

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
  const { assetData, decisions } = useContext(AssetsContext);
  
  const handleDownload = useCallback((mimeType: string, base64: string, name: string) => {
    const uri = `data:${mimeType};base64,${base64}`;
    const link = document.createElement('a');

    link.href = uri;
    link.setAttribute('download', `${name}.pdf`);
    document.body.appendChild(link);
    link.click();
  }, []);

  const validAttachments = useMemo(() => {
    if (!decisions?.length) {
      return undefined;
    }

    const orderedDecisions = decisions.sort((a, b) => {
      const aTime = new Date(a.decidedAt ?? 0).getTime();
      const bTime = new Date(b.decidedAt ?? 0).getTime();
      return Math.sign(bTime - aTime);
    });

    const activeAttachments = orderedDecisions[orderedDecisions.length - 1].attachments;
    if (!activeAttachments?.length) {
      return undefined;
    }

    return activeAttachments.filter(attachment =>
      attachment.mimeType === 'application/json' && attachment.file && attachment.name
    );
  } , [decisions]);

  return (
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
      <div className="flex flex-col desktop:flex-row gap-24 desktop:gap-80 flex-wrap">
        {assetData?.caseReferenceIds?.length ? (
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">Ärendenummer</div>
            <div>{assetData?.caseReferenceIds?.map((id) => <div key={id}>{id}</div>)}</div>
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
      { validAttachments ? (
        <div className="flex flex-col items-start gap-4">
          <div className="font-bold">Dokument</div>
          { validAttachments.map(attachment => (
            <Button variant="link" onClick={() => handleDownload(attachment.mimeType!, attachment.file!, attachment.name!)}>
              <Icon size={16} icon={<File />} className="mr-8"/>
              Ladda ner beslut ({attachment.extension})
            </Button>
          ))}
        </div>
      ): null }
    </Card>
  );
}
