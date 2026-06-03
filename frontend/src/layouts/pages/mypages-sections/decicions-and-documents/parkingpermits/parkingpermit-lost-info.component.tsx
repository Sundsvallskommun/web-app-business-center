import { Button } from '@sk-web-gui/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LostPermitInfo = ({
  setIsEditing,
  setFormState,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<null | 'PERMIT_RENEWAL' | 'LOST_PERMIT'>>;
  setFormState: React.Dispatch<React.SetStateAction<'showForm' | 'showInfo' | 'success'>>;
}) => {
  const { t } = useTranslation('decisions');

  return (
    <>
      <div>
        <h2 className="text-h4-sm desktop:text-h4-sm my-16">{t('decisions:parkingPermit.lost.info.title')}</h2>
        <ul className="list-disc pl-20 mt-12">
          <li>{t('decisions:parkingPermit.lost.info.makePoliceReport')}</li>
          <li>{t('decisions:parkingPermit.lost.info.haveCopy')}</li>
          <li>{t('decisions:parkingPermit.lost.info.identifyNumber')}</li>
        </ul>
      </div>
      <div>
        <h2 className="text-h4-sm desktop:text-h4-sm my-16">{t('decisions:parkingPermit.lost.info.whatHappensTitle')}</h2>
        <p className="mt-12">
          {t('decisions:parkingPermit.lost.info.whatHappensDescription')}
        </p>
      </div>
      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
        <Button size="lg" variant="secondary" leftIcon={<ArrowLeft />} onClick={() => setIsEditing(null)}>
          {t('decisions:parkingPermit.lost.info.back')}
        </Button>
        <Button size="lg" color="vattjom" rightIcon={<ArrowRight />} onClick={() => setFormState('showForm')}>
          {t('decisions:parkingPermit.lost.info.startReport')}
        </Button>
      </div>
    </>
  );
};
