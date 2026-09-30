'use client';

import { Card } from '@components/cards/card.component';
import {
  formatAssetDate,
  formatAssetValidity,
  getAssetStatusProps,
  isParkingPermit,
  soonExpiring,
} from '@services/asset-service';
import sanitized from '@services/sanitizer-service';
import { Button, Divider, Icon, Label } from '@sk-web-gui/react';
import { ArrowRight, Car, Cog, FileCheck2, PlusCircle } from 'lucide-react';
import { ReactNode, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsContext } from './asset-layout.component';
import { DecisionList } from './decision-card.component';
import ParkingPermitLost from './parkingpermits/parkingpermit-lost.component';
import ParkingPermitRenewalAlert from './parkingpermits/parkingpermit-renewal-alert.component';
import ParkingPermitRenewal from './parkingpermits/parkingpermit-renewal.component';

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

export default function Asset() {
  const { t } = useTranslation('decisions');
  const [isEditing, setisEditing] = useState<null | 'PERMIT_RENEWAL' | 'LOST_PERMIT'>(null);
  const { document, assetData } = useContext(AssetsContext);
  const statusProps = getAssetStatusProps(document?.status);
  const service = assetData?.service;
  const title = document?.title;
  const validity = formatAssetValidity(document, t);
  const issued = formatAssetDate(document?.issued);
  const decisions = document?.decisions ?? [];
  const parkingPermit = assetData && isParkingPermit(assetData) ? assetData : undefined;

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
          <div className="flex flex-col gap-4">
            <h1 className="text-h2-sm desktop:text-h2-lg mb-0 break-word hyphens-auto">{title}</h1>
            <span className="text-small text-dark-secondary">{validity}</span>
          </div>
        </div>
        <span className="flex flex-wrap gap-8">
          <Label rounded inverted color={statusProps.color}>
            {t(statusProps.tKey)}
          </Label>
          {service?.isWinterService ? (
            <Label rounded inverted color="info">
              {t('decisions:asset.service.winterService')}
            </Label>
          ) : null}
        </span>
      </div>
      <Divider className="my-0" />
      {parkingPermit && soonExpiring(parkingPermit) ? <ParkingPermitRenewalAlert setIsEditing={setisEditing} /> : null}
      {parkingPermit ? (
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
            <div>{assetData.assetId}</div>
          </div>
        ) : null}
        {document?.issued || document?.validTo ? (
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">{t('decisions:asset.validityPeriod')}</div>
            <div>{validity}</div>
          </div>
        ) : null}
        {issued ? (
          <div className="flex flex-col items-start gap-4">
            <div className="font-bold">{t('decisions:asset.decided')}</div>
            <div>{issued}</div>
          </div>
        ) : null}
      </div>
      {service ? (
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
      ) : null}
      {decisions.length > 0 ? (
        <div>
          <Divider className="mb-32" />
          <h4 className="text-h4-md mb-24">{t('decisions:decisionsForDocument', { title: title })}</h4>
          <div className="flex flex-col gap-8">
            <DecisionList decisions={decisions} aria-label={t('decisions:decisionsForDocument', { title: title })} />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
