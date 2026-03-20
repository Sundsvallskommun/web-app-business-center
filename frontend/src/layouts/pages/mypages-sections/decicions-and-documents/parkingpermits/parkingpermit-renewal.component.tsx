import { Card } from '@components/cards/card.component';
import { useApi } from '@services/api-service';
import { Spinner } from '@sk-web-gui/react';
import { useContext, useState } from 'react';
import { AssetsContext } from '../asset-layout.component';
import { ExtraParameter, ParkingPermitForm } from './parkingpermit-form.component';
import { RenewalInfo } from './parkingpermit-renewal-info.component';
import { RenewalSuccess } from './parkingpermit-renewal-success.component';

interface ErrandByIdResponse {
  extraParameters: ExtraParameter[];
  errandNumber?: string;
}

export default function ParkingPermitRenewal({
  setIsEditing,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<null | 'PERMIT_RENEWAL' | 'LOST_PERMIT'>>;
}) {
  const { assetData } = useContext(AssetsContext);
  const [formState, setFormState] = useState<'showForm' | 'showInfo' | 'success'>('showInfo');

  // Get the first caseReferenceId (UUID) and assetId (errand number)
  const caseReferenceId = assetData?.caseReferenceIds?.[0];
  const assetId = assetData?.assetId;

  // Priority 1: Fetch by errand ID (caseReferenceId) if available
  const { data: errandByIdData, isLoading: isLoadingById } = useApi<ErrandByIdResponse>({
    url: `/assets/errand/id/${caseReferenceId}`,
    method: 'get',
    queryOptions: {
      enabled: formState === 'showForm' && !!caseReferenceId,
    },
  });

  // Priority 2: Fetch by errand number (assetId) if ID fetch didn't return data
  const shouldFetchByNumber = formState === 'showForm' && !!assetId && !caseReferenceId;
  const { data: errandByNumberData, isLoading: isLoadingByNumber } = useApi<ExtraParameter[]>({
    url: `/assets/errand/${assetId}`,
    method: 'get',
    queryOptions: {
      enabled: shouldFetchByNumber,
    },
  });

  // Determine errand data and errand number from fetch results
  const errandData = errandByIdData?.extraParameters ?? errandByNumberData ?? undefined;
  const errandNumber = errandByIdData?.errandNumber ?? assetId;

  // Show loading state when fetching
  const isLoading =
    formState === 'showForm' && ((!!caseReferenceId && isLoadingById) || (shouldFetchByNumber && isLoadingByNumber));

  return (
    <Card className="px-20 desktop:px-32 desktop:py-40">
      <div className="flex flex-col gap-40">
        {formState === 'showForm' || formState === 'showInfo' ? (
          <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center">
            <h1 className="text-h2-sm desktop:text-h2-lg mb-0 break-word hyphens-auto">
              Ansök om att förlänga parkeringstillstånd
            </h1>
          </div>
        ) : null}
        {formState === 'showForm' ? (
          isLoading ? (
            <div className="flex justify-center items-center py-40">
              <Spinner size={4} />
              <span className="ml-16">Hämtar tidigare uppgifter...</span>
            </div>
          ) : (
            <ParkingPermitForm
              mode="renewal"
              setFormState={setFormState}
              errandData={errandData}
              errandNumber={errandNumber}
              assetValidTo={assetData?.validTo}
            />
          )
        ) : formState === 'showInfo' ? (
          <RenewalInfo setIsEditing={setIsEditing} setFormState={setFormState} />
        ) : formState === 'success' ? (
          <RenewalSuccess setIsEditing={setIsEditing} />
        ) : null}
      </div>
    </Card>
  );
}
