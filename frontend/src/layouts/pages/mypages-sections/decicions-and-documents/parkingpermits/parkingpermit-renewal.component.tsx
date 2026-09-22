import { Card } from '@components/cards/card.component';
import { ParkingPermitRenewalPrefill } from '@data-contracts/backend/data-contracts';
import { useApi } from '@services/api-service';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsContext } from '../asset-layout.component';
import { ParkingPermitRenewalForm } from './parkingpermit-renewal-form.component';
import { RenewalInfo } from './parkingpermit-renewal-info.component';
import { RenewalSuccess } from './parkingpermit-renewal-success.component';

export default function ParkingPermitRenewal({
  setIsEditing,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<null | 'PERMIT_RENEWAL' | 'LOST_PERMIT'>>;
}) {
  const { t } = useTranslation('decisions');
  const [formState, setFormState] = useState<'showForm' | 'showInfo' | 'success'>('showInfo');
  const { assetData } = useContext(AssetsContext);
  const assetId = assetData?.id;

  const { data: prefill, isPending } = useApi<ParkingPermitRenewalPrefill>({
    url: `/assets/${assetId}/renewal-prefill`,
    method: 'get',
    queryOptions: { enabled: !!assetId },
  });

  const isPrefillLoading = !!assetId && isPending;

  return (
    <Card className="px-20 desktop:px-32 desktop:py-40">
      <div className="flex flex-col gap-40">
        {formState === 'showForm' || formState === 'showInfo' ? (
          <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center">
            <h1 className="text-h2-sm desktop:text-h2-lg mb-0 break-word hyphens-auto">
              {t('decisions:parkingPermit.renewal.title')}
            </h1>
          </div>
        ) : null}
        {formState === 'showForm' && !isPrefillLoading ? (
          <ParkingPermitRenewalForm setFormState={setFormState} prefill={prefill} />
        ) : formState === 'showInfo' ? (
          <RenewalInfo setIsEditing={setIsEditing} setFormState={setFormState} />
        ) : formState === 'success' ? (
          <RenewalSuccess setIsEditing={setIsEditing} />
        ) : null}
      </div>
    </Card>
  );
}
