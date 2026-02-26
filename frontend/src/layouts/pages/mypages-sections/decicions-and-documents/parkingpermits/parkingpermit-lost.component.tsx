import { Card } from '@components/cards/card.component';
import { useState } from 'react';
import { ParkingPermitLostForm } from './parkingpermit-lost-form.component';
import { LostPermitInfo } from './parkingpermit-lost-info.component';
import { LostPermitSuccess } from './parkingpermit-lost-success.component';

export default function ParkingPermitLost({
  setIsEditing,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<null | 'PERMIT_RENEWAL' | 'LOST_PERMIT'>>;
}) {
  const [formState, setFormState] = useState<'showForm' | 'showInfo' | 'success'>('showInfo');

  return (
    <Card className="px-20 desktop:px-32 desktop:py-40">
      <div className="flex flex-col gap-40">
        {formState === 'showForm' || formState === 'showInfo' ? (
          <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center">
            <h1 className="text-h2-sm desktop:text-h2-lg mb-0 break-word hyphens-auto">
              Anmäl borttappat parkeringstillstånd
            </h1>
          </div>
        ) : null}
        {formState === 'showForm' ? (
          <ParkingPermitLostForm setFormState={setFormState} />
        ) : formState === 'showInfo' ? (
          <LostPermitInfo setIsEditing={setIsEditing} setFormState={setFormState} />
        ) : formState === 'success' ? (
          <LostPermitSuccess setIsEditing={setIsEditing} />
        ) : null}
      </div>
    </Card>
  );
}
