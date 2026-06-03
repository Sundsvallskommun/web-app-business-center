import { Button, Icon } from '@sk-web-gui/react';
import { ArrowRight, CircleCheckBig } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const RenewalSuccess = ({
  setIsEditing,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<null | 'PERMIT_RENEWAL' | 'LOST_PERMIT'>>;
}) => {
  const { t } = useTranslation('decisions');

  return (
    <>
      <div className="flex flex-col gap-24">
        <Icon icon={<CircleCheckBig />} size={48} color="success" />
        <h1 className="text-h2-sm desktop:text-h2-lg mb-0 break-word hyphens-auto">
          {t('decisions:parkingPermit.renewal.success.title')}
        </h1>
        <div>
          <p className="mt-0">{t('decisions:parkingPermit.renewal.success.description')}</p>
          <p className="mt-0">
            {t('decisions:parkingPermit.renewal.success.processing')}
          </p>
        </div>
      </div>
      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
        <Button size="lg" color="vattjom" rightIcon={<ArrowRight />} onClick={() => setIsEditing(null)}>
          {t('decisions:parkingPermit.renewal.success.backToOverview')}
        </Button>
      </div>
    </>
  );
};
