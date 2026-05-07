import { Button } from '@sk-web-gui/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const RenewalInfo = ({
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
        <h2 className="text-h4-sm desktop:text-h4-sm my-16">{t('decisions:parkingPermit.renewal.info.title')}</h2>
        <p className="mt-12">
          {t('decisions:parkingPermit.renewal.info.medicalCertificateRequired')}
        </p>
        <p className="mt-12">
          {t('decisions:parkingPermit.renewal.info.medicalCertificateRenewal')}
        </p>
      </div>
      <div>
        <h2 className="text-h4-sm desktop:text-h4-sm my-16">{t('decisions:parkingPermit.renewal.info.certificateVia1177')}</h2>
        <ol>
          <li>{t('decisions:parkingPermit.renewal.info.saveCertificate')}</li>
          <li>{t('decisions:parkingPermit.renewal.info.uploadFile')}</li>
        </ol>
      </div>
      <div>
        <h2 className="text-h4-sm desktop:text-h4-sm my-16">{t('decisions:parkingPermit.renewal.info.whatHappensTitle')}</h2>
        <p className="mt-12">
          {t('decisions:parkingPermit.renewal.info.whatHappensDescription')}
        </p>
      </div>
      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
        <Button size="lg" variant="secondary" leftIcon={<ArrowLeft />} onClick={() => setIsEditing(null)}>
          {t('decisions:parkingPermit.renewal.info.back')}
        </Button>
        <Button size="lg" color="vattjom" rightIcon={<ArrowRight />} onClick={() => setFormState('showForm')}>
          {t('decisions:parkingPermit.renewal.info.startApplication')}
        </Button>
      </div>
    </>
  );
};
