'use client';

import { Card } from '@components/cards/card.component';
import { DocumentDetails } from '@data-contracts/backend/data-contracts';
import { getAssetStatusProps } from '@services/asset-service';
import { DocumentFact, getDocumentFacts, getDocumentSubtitle } from '@services/document-service';
import { Divider, Icon, Label } from '@sk-web-gui/react';
import { FileCheck2 } from 'lucide-react';
import { ReactNode, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsContext } from './asset-layout.component';
import ByggrDetails from './byggr-details.component';
import ParkingPermitLost from './parkingpermits/parkingpermit-lost.component';
import ParkingPermitRenewal from './parkingpermits/parkingpermit-renewal.component';
import PartyassetsDetails, { EditingMode } from './partyassets-details.component';

const DocumentHeader = ({
  document,
  subtitle,
  children,
}: {
  document: DocumentDetails;
  subtitle?: string;
  children?: ReactNode;
}) => {
  const { t } = useTranslation('decisions');
  const statusProps = getAssetStatusProps(document.status);

  return (
    <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center">
      <div className="flex gap-x-8 desktop:gap-x-24">
        <div className="list-item-card-content-icon">
          <Icon icon={<FileCheck2 />} />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-h2-sm desktop:text-h2-lg mb-0 break-word hyphens-auto">{document.title}</h1>
          {subtitle ? <span className="text-small text-dark-secondary">{subtitle}</span> : null}
        </div>
      </div>
      <span className="flex flex-wrap gap-8">
        {document.status ? (
          <Label rounded inverted color={statusProps.color}>
            {t(statusProps.tKey)}
          </Label>
        ) : null}
        {children}
      </span>
    </div>
  );
};

const DocumentFacts = ({ facts }: { facts: DocumentFact[] }) => {
  if (facts.length === 0) return null;

  return (
    <div className="flex flex-col desktop:flex-row gap-24 desktop:gap-80 flex-wrap">
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col items-start gap-4">
          <div className="font-bold">{fact.label}</div>
          <div>{fact.value}</div>
        </div>
      ))}
    </div>
  );
};

export default function Asset() {
  const { t } = useTranslation('decisions');
  const { document, assetData } = useContext(AssetsContext);
  const [editing, setEditing] = useState<EditingMode>(null);

  if (!document) return null;
  if (editing === 'PERMIT_RENEWAL') return <ParkingPermitRenewal setIsEditing={setEditing} />;
  if (editing === 'LOST_PERMIT') return <ParkingPermitLost setIsEditing={setEditing} />;

  return (
    <Card>
      <DocumentHeader document={document} subtitle={getDocumentSubtitle(document, t)}>
        {assetData?.service?.isWinterService ? (
          <Label rounded inverted color="info">
            {t('decisions:asset.service.winterService')}
          </Label>
        ) : null}
      </DocumentHeader>
      <Divider className="my-0" />
      <DocumentFacts facts={getDocumentFacts(document, assetData, t)} />
      {document.source === 'BYGGR' ? (
        <ByggrDetails document={document} />
      ) : (
        <PartyassetsDetails document={document} asset={assetData} setEditing={setEditing} />
      )}
    </Card>
  );
}
