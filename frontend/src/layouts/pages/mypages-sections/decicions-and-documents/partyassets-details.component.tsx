'use client';

import { DocumentDetails } from '@data-contracts/backend/data-contracts';
import { AssetWithService, ServiceDetails } from '@interfaces/asset';
import { isParkingPermit, soonExpiring } from '@services/asset-service';
import sanitized from '@services/sanitizer-service';
import { Button, Divider } from '@sk-web-gui/react';
import { ArrowRight, Car, Cog, PlusCircle } from 'lucide-react';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { DecisionList } from './decision-card.component';
import ParkingPermitRenewalAlert from './parkingpermits/parkingpermit-renewal-alert.component';

export type EditingMode = null | 'PERMIT_RENEWAL' | 'LOST_PERMIT';
type SetEditing = Dispatch<SetStateAction<EditingMode>>;

const Chips = ({ items, emptyText }: { items?: string[]; emptyText: string }) => {
  if (!items || items.length === 0) {
    return <span className="text-small text-dark-disabled italic">{emptyText}</span>;
  }
  return (
    <div className="flex flex-wrap gap-6">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="inline-flex items-center text-small bg-vattjom-background-200 text-dark-primary rounded-full px-10 py-4"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

const Section = ({ icon, label, children }: { icon?: ReactNode; label: string; children: ReactNode }) => (
  <div className="flex flex-col items-start gap-8">
    <div className="flex items-center gap-6 text-small font-bold text-dark-secondary uppercase tracking-wide">
      {icon}
      {label}
    </div>
    {children}
  </div>
);

const ParkingPermitActions = ({ permit, setEditing }: { permit: AssetWithService; setEditing: SetEditing }) => {
  const { t } = useTranslation('decisions');

  return (
    <>
      {soonExpiring(permit) ? <ParkingPermitRenewalAlert setIsEditing={setEditing} /> : null}
      <div className="mt-0 w-full desktop:w-auto">
        <Button
          className="w-full desktop:w-auto"
          variant="secondary"
          rightIcon={<ArrowRight />}
          onClick={() => setEditing('LOST_PERMIT')}
          data-cy="report-lost-permit-button"
        >
          {t('decisions:asset.reportLostPermit')}
        </Button>
      </div>
    </>
  );
};

const AssetServiceDetails = ({ service }: { service: ServiceDetails }) => {
  const { t } = useTranslation('decisions');

  return (
    <>
      <Divider className="my-0" />
      <div className="flex flex-col gap-24">
        <Section icon={<Car size={14} />} label={t('decisions:asset.service.transportMode')}>
          <Chips items={service.transportMode} emptyText={t('decisions:asset.service.transportModeEmpty')} />
        </Section>
        <Section icon={<Cog size={14} />} label={t('decisions:asset.service.aids')}>
          <Chips items={service.aids} emptyText={t('decisions:asset.service.aidsEmpty')} />
        </Section>
        <Section icon={<PlusCircle size={14} />} label={t('decisions:asset.service.addon')}>
          <Chips items={service.addon} emptyText={t('decisions:asset.service.addonEmpty')} />
        </Section>
        {service.comment ? (
          <Section label={t('decisions:asset.service.comment')}>
            <div
              className="text-base text-dark-primary break-words whitespace-pre-wrap [word-break:break-word]"
              dangerouslySetInnerHTML={{ __html: sanitized(service.comment) }}
            />
          </Section>
        ) : null}
      </div>
    </>
  );
};

const DocumentDecisions = ({ document }: { document: DocumentDetails }) => {
  const { t } = useTranslation('decisions');
  const label = t('decisions:decisionsForDocument', { title: document.title });

  return (
    <div>
      <Divider className="mb-32" />
      <h4 className="text-h4-md mb-24">{label}</h4>
      <div className="flex flex-col gap-8">
        <DecisionList decisions={document.decisions} aria-label={label} />
      </div>
    </div>
  );
};

export default function PartyassetsDetails({
  document,
  asset,
  setEditing,
}: {
  document: DocumentDetails;
  asset?: AssetWithService;
  setEditing: SetEditing;
}) {
  const parkingPermit = asset && isParkingPermit(asset) ? asset : undefined;

  return (
    <>
      {parkingPermit ? <ParkingPermitActions permit={parkingPermit} setEditing={setEditing} /> : null}
      {asset?.service ? <AssetServiceDetails service={asset.service} /> : null}
      {document.decisions.length > 0 ? <DocumentDecisions document={document} /> : null}
    </>
  );
}
