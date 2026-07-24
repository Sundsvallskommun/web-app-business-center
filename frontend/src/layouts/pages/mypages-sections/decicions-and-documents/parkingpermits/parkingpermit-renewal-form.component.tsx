import { useApi } from '@services/api-service';
import { ACCEPTED_UPLOAD_FILETYPES } from '@utils/accepted-file-types';
import {
  Button,
  Checkbox,
  FileUpload,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  RadioButton,
  Select,
  Textarea,
  UploadFile,
  useConfirm,
  useSnackbar,
} from '@sk-web-gui/react';
import { toBase64 } from '@utils/toBase64';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const MAX_FILE_SIZE_MB = 50;

interface PermitRenewalFormModel {
  changedCircumstances: string;
  caseMeaning: string;
  capacity: string;
  reason: string;
  walkingAids: string[];
  walkingAbility: string;
  walkingDistanceBeforeRest: string;
  walkingDistanceMax: string;
  duration: string;
  canBeAloneWhileParking: string;
  canBeAloneWhileParkingNote: string;
  consentContactDoctor: string;
  consentViewTransportationService: string;
  signingAbility: string;
  expirationDate: string;
  files: UploadFile[];
}

export const ParkingPermitRenewalForm = ({
  setFormState,
}: {
  setFormState: React.Dispatch<React.SetStateAction<'showForm' | 'showInfo' | 'success'>>;
}) => {
  const { t } = useTranslation('decisions');
  const confirm = useConfirm();
  const toastMessage = useSnackbar();

  const walkingAids = [
    { label: t('decisions:parkingPermit.renewal.form.walkingAids.rollator'), value: 'Rullator' },
    { label: t('decisions:parkingPermit.renewal.form.walkingAids.electricWheelchair'), value: 'Elrullstol' },
    { label: t('decisions:parkingPermit.renewal.form.walkingAids.crutch'), value: 'Krycka/kryckor/käpp' },
    { label: t('decisions:parkingPermit.renewal.form.walkingAids.manualWheelchair'), value: 'Rullstol (manuell)' },
    { label: t('decisions:parkingPermit.renewal.form.walkingAids.none'), value: 'Inget' },
  ];

  const durationOptions = [
    { label: t('decisions:parkingPermit.renewal.form.duration.lessThan6Months'), value: 'P6M' },
    { label: t('decisions:parkingPermit.renewal.form.duration.upTo1Year'), value: 'P1Y' },
    { label: t('decisions:parkingPermit.renewal.form.duration.upTo2Years'), value: 'P2Y' },
    { label: t('decisions:parkingPermit.renewal.form.duration.upTo3Years'), value: 'P3Y' },
    { label: t('decisions:parkingPermit.renewal.form.duration.upTo4Years'), value: 'P4Y' },
    { label: t('decisions:parkingPermit.renewal.form.duration.moreThan4Years'), value: 'P5Y' },
    { label: t('decisions:parkingPermit.renewal.form.duration.permanent'), value: 'P0Y' },
  ];

  const form = useForm<PermitRenewalFormModel>({
    defaultValues: {
      changedCircumstances: 'Y',
      caseMeaning: '',
      capacity: '',
      reason: '',
      walkingAids: [],
      walkingAbility: '',
      walkingDistanceBeforeRest: '',
      walkingDistanceMax: '',
      duration: '',
      canBeAloneWhileParking: '',
      canBeAloneWhileParkingNote: '',
      consentContactDoctor: '',
      consentViewTransportationService: '',
      signingAbility: '',
      expirationDate: '',
      files: [],
    },
    mode: 'onChange',
  });

  const registerErrand = useApi<unknown>({
    url: '/assets/parkingpermit/extend',
    method: 'post',
    axiosParameters: { headers: { 'Content-Type': 'multipart/form-data' } },
  });

  const onSubmit = async (data: PermitRenewalFormModel) => {
    const confirmed = await confirm.showConfirmation(
      t('decisions:parkingPermit.renewal.form.confirmTitle'),
      t('decisions:parkingPermit.renewal.form.confirmDescription'),
      t('decisions:parkingPermit.renewal.form.yes'),
      t('decisions:parkingPermit.renewal.form.no'),
      'info'
    );
    if (confirmed) {
      const formData = new FormData();
      // Legacy-compatible fields — preserve the existing backend contract.
      formData.append('circumstancesChanged', data.changedCircumstances === 'Y' ? 'TRUE' : 'FALSE');
      formData.append('date', data.expirationDate);
      formData.append('walkingAids', JSON.stringify(data.walkingAids));
      // New fields — sent raw, not yet consumed by the backend (Step 1).
      formData.append('caseMeaning', data.caseMeaning);
      formData.append('capacity', data.capacity);
      formData.append('reason', data.reason);
      formData.append('walkingAbility', data.walkingAbility);
      formData.append('walkingDistanceBeforeRest', data.walkingDistanceBeforeRest);
      formData.append('walkingDistanceMax', data.walkingDistanceMax);
      formData.append('duration', data.duration);
      formData.append('canBeAloneWhileParking', data.canBeAloneWhileParking);
      formData.append('canBeAloneWhileParkingNote', data.canBeAloneWhileParkingNote);
      formData.append('consentContactDoctor', data.consentContactDoctor);
      formData.append('consentViewTransportationService', data.consentViewTransportationService);
      formData.append('signingAbility', data.signingAbility);

      if (data.files.length) {
        try {
          await Promise.all(
            data.files.map(async (file) => {
              if (file.file instanceof Blob) {
                const fileData = await toBase64(file.file);
                const buf = Buffer.from(fileData, 'base64');
                const blob = new Blob([buf], { type: file.file.type });
                formData.append('files', blob, `${file.meta.name}.${file.meta.ending}`);
              }
            })
          );
        } catch {
          // File processing error - continue with submission
        }
      }

      try {
        await registerErrand.mutateAsync(formData);
        form.reset();
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: t('decisions:parkingPermit.renewal.form.successMessage'),
          status: 'success',
        });
        setFormState('success');
      } catch {
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: t('decisions:parkingPermit.renewal.form.errorMessage'),
          status: 'error',
        });
      }
    }
  };

  const files = form.watch('files');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-56">
      <div className="flex flex-col">
        <FormLabel className="mb-12">{t('decisions:parkingPermit.renewal.form.circumstancesChanged')}</FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            data-cy={`circumstances-changed-true`}
            size="sm"
            className="mr-sm"
            name={`changedCircumstances-true`}
            id={`changedCircumstances-true`}
            value={'Y'}
            checked={form.watch('changedCircumstances') === 'Y'}
            onChange={() => {}}
            onClick={() => {
              form.setValue('changedCircumstances', 'Y');
            }}
          >
            {t('decisions:parkingPermit.renewal.form.yes')}
          </RadioButton>
          <RadioButton
            data-cy={`circumstances-changed-false`}
            size="sm"
            className="mr-sm"
            name={`changedCircumstances-false`}
            id={`changedCircumstances-false`}
            value={'N'}
            onChange={() => {}}
            checked={form.watch('changedCircumstances') === 'N'}
            onClick={() => {
              form.setValue('changedCircumstances', 'N');
            }}
          >
            {t('decisions:parkingPermit.renewal.form.no')}
          </RadioButton>
        </RadioButton.Group>
      </div>
      {form.watch('changedCircumstances') === 'Y' && (
        <>
          <FormControl className="w-full desktop:w-3/4">
            <FormLabel htmlFor="caseMeaning">{t('decisions:parkingPermit.renewal.form.caseMeaningLabel')}</FormLabel>
            <Input data-cy="case-meaning" {...form.register('caseMeaning')} placeholder="" />
          </FormControl>

          <div className="flex flex-col">
            <FormLabel className="mb-12">{t('decisions:parkingPermit.renewal.form.capacityLabel')}</FormLabel>
            <RadioButton.Group inline>
              <RadioButton
                data-cy={`capacity-driver`}
                size="sm"
                className="mr-sm"
                name={`capacity-driver`}
                id={`capacity-driver`}
                value={'DRIVER'}
                checked={form.watch('capacity') === 'DRIVER'}
                onChange={() => {}}
                onClick={() => {
                  form.setValue('capacity', 'DRIVER');
                }}
              >
                {t('decisions:parkingPermit.renewal.form.capacity.driver')}
              </RadioButton>
              <RadioButton
                data-cy={`capacity-passenger`}
                size="sm"
                className="mr-sm"
                name={`capacity-passenger`}
                id={`capacity-passenger`}
                value={'PASSENGER'}
                checked={form.watch('capacity') === 'PASSENGER'}
                onChange={() => {}}
                onClick={() => {
                  form.setValue('capacity', 'PASSENGER');
                }}
              >
                {t('decisions:parkingPermit.renewal.form.capacity.passenger')}
              </RadioButton>
            </RadioButton.Group>
          </div>

          <FormControl className="w-full desktop:w-3/4">
            <FormLabel htmlFor="reason">{t('decisions:parkingPermit.renewal.form.reasonLabel')}</FormLabel>
            <Textarea data-cy="reason" {...form.register('reason')} className="w-full min-h-72" />
          </FormControl>

          <FormControl>
            <FormLabel>{t('decisions:parkingPermit.renewal.form.walkingAidsLabel')}</FormLabel>
            <Checkbox.Group direction="row" className="gap-16 flex flex-col desktop:flex-row">
              {walkingAids.map((aid, index) => (
                <Checkbox
                  key={`${aid.value}-${index}`}
                  value={aid.value}
                  data-cy={`walking-aids-checkbox-${index}`}
                  {...form.register('walkingAids')}
                >
                  {aid.label}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </FormControl>

          <div className="flex flex-col">
            <FormLabel className="mb-12">{t('decisions:parkingPermit.renewal.form.walkingAbilityLabel')}</FormLabel>
            <RadioButton.Group inline>
              <RadioButton
                data-cy={`walking-ability-wheelchair`}
                size="sm"
                className="mr-sm"
                name={`walking-ability-wheelchair`}
                id={`walking-ability-wheelchair`}
                value={'false'}
                checked={form.watch('walkingAbility') === 'false'}
                onChange={() => {}}
                onClick={() => {
                  form.setValue('walkingAbility', 'false');
                }}
              >
                {t('decisions:parkingPermit.renewal.form.walkingAbility.wheelchairBound')}
              </RadioButton>
              <RadioButton
                data-cy={`walking-ability-can-walk`}
                size="sm"
                className="mr-sm"
                name={`walking-ability-can-walk`}
                id={`walking-ability-can-walk`}
                value={'true'}
                checked={form.watch('walkingAbility') === 'true'}
                onChange={() => {}}
                onClick={() => {
                  form.setValue('walkingAbility', 'true');
                }}
              >
                {t('decisions:parkingPermit.renewal.form.walkingAbility.canWalkShort')}
              </RadioButton>
            </RadioButton.Group>
          </div>

          <FormControl className="w-full desktop:w-3/4">
            <FormLabel htmlFor="walkingDistanceBeforeRest">
              {t('decisions:parkingPermit.renewal.form.walkingDistanceBeforeRestLabel')}
            </FormLabel>
            <Input
              data-cy="walking-distance-before-rest"
              {...form.register('walkingDistanceBeforeRest')}
              placeholder=""
            />
          </FormControl>

          <FormControl className="w-full desktop:w-3/4">
            <FormLabel htmlFor="walkingDistanceMax">
              {t('decisions:parkingPermit.renewal.form.walkingDistanceMaxLabel')}
            </FormLabel>
            <Input data-cy="walking-distance-max" {...form.register('walkingDistanceMax')} placeholder="" />
          </FormControl>

          <FormControl className="w-full desktop:w-3/4">
            <FormLabel htmlFor="duration">{t('decisions:parkingPermit.renewal.form.durationLabel')}</FormLabel>
            <Select
              data-cy="duration-select"
              value={form.watch('duration')}
              onSelectValue={(value: string) => form.setValue('duration', value)}
            >
              <Select.Option value="">{t('decisions:parkingPermit.renewal.form.durationPlaceholder')}</Select.Option>
              {durationOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </FormControl>

          {form.watch('capacity') === 'PASSENGER' && (
            <>
              <div className="flex flex-col">
                <FormLabel className="mb-12">{t('decisions:parkingPermit.renewal.form.canBeAloneLabel')}</FormLabel>
                <RadioButton.Group inline>
                  <RadioButton
                    data-cy={`can-be-alone-true`}
                    size="sm"
                    className="mr-sm"
                    name={`can-be-alone-true`}
                    id={`can-be-alone-true`}
                    value={'true'}
                    checked={form.watch('canBeAloneWhileParking') === 'true'}
                    onChange={() => {}}
                    onClick={() => {
                      form.setValue('canBeAloneWhileParking', 'true');
                    }}
                  >
                    {t('decisions:parkingPermit.renewal.form.yes')}
                  </RadioButton>
                  <RadioButton
                    data-cy={`can-be-alone-false`}
                    size="sm"
                    className="mr-sm"
                    name={`can-be-alone-false`}
                    id={`can-be-alone-false`}
                    value={'false'}
                    checked={form.watch('canBeAloneWhileParking') === 'false'}
                    onChange={() => {}}
                    onClick={() => {
                      form.setValue('canBeAloneWhileParking', 'false');
                    }}
                  >
                    {t('decisions:parkingPermit.renewal.form.no')}
                  </RadioButton>
                </RadioButton.Group>
              </div>

              {form.watch('canBeAloneWhileParking') === 'false' && (
                <FormControl className="w-full desktop:w-3/4">
                  <FormLabel htmlFor="canBeAloneWhileParkingNote">
                    {t('decisions:parkingPermit.renewal.form.canBeAloneNoteLabel')}
                  </FormLabel>
                  <Textarea
                    data-cy="can-be-alone-note"
                    {...form.register('canBeAloneWhileParkingNote')}
                    className="w-full min-h-72"
                  />
                </FormControl>
              )}
            </>
          )}

          <div className="flex flex-col">
            <FormLabel className="mb-12">
              {t('decisions:parkingPermit.renewal.form.consentContactDoctorLabel')}
            </FormLabel>
            <RadioButton.Group inline>
              <RadioButton
                data-cy={`consent-contact-doctor-true`}
                size="sm"
                className="mr-sm"
                name={`consent-contact-doctor-true`}
                id={`consent-contact-doctor-true`}
                value={'true'}
                checked={form.watch('consentContactDoctor') === 'true'}
                onChange={() => {}}
                onClick={() => {
                  form.setValue('consentContactDoctor', 'true');
                }}
              >
                {t('decisions:parkingPermit.renewal.form.yes')}
              </RadioButton>
              <RadioButton
                data-cy={`consent-contact-doctor-false`}
                size="sm"
                className="mr-sm"
                name={`consent-contact-doctor-false`}
                id={`consent-contact-doctor-false`}
                value={'false'}
                checked={form.watch('consentContactDoctor') === 'false'}
                onChange={() => {}}
                onClick={() => {
                  form.setValue('consentContactDoctor', 'false');
                }}
              >
                {t('decisions:parkingPermit.renewal.form.no')}
              </RadioButton>
            </RadioButton.Group>
          </div>

          <div className="flex flex-col">
            <FormLabel className="mb-12">
              {t('decisions:parkingPermit.renewal.form.consentTransportationServiceLabel')}
            </FormLabel>
            <RadioButton.Group inline>
              <RadioButton
                data-cy={`consent-transportation-true`}
                size="sm"
                className="mr-sm"
                name={`consent-transportation-true`}
                id={`consent-transportation-true`}
                value={'true'}
                checked={form.watch('consentViewTransportationService') === 'true'}
                onChange={() => {}}
                onClick={() => {
                  form.setValue('consentViewTransportationService', 'true');
                }}
              >
                {t('decisions:parkingPermit.renewal.form.yes')}
              </RadioButton>
              <RadioButton
                data-cy={`consent-transportation-false`}
                size="sm"
                className="mr-sm"
                name={`consent-transportation-false`}
                id={`consent-transportation-false`}
                value={'false'}
                checked={form.watch('consentViewTransportationService') === 'false'}
                onChange={() => {}}
                onClick={() => {
                  form.setValue('consentViewTransportationService', 'false');
                }}
              >
                {t('decisions:parkingPermit.renewal.form.no')}
              </RadioButton>
            </RadioButton.Group>
          </div>

          <div className="flex flex-col">
            <FormLabel className="mb-12">{t('decisions:parkingPermit.renewal.form.signingAbilityLabel')}</FormLabel>
            <RadioButton.Group inline>
              <RadioButton
                data-cy={`signing-ability-true`}
                size="sm"
                className="mr-sm"
                name={`signing-ability-true`}
                id={`signing-ability-true`}
                value={'true'}
                checked={form.watch('signingAbility') === 'true'}
                onChange={() => {}}
                onClick={() => {
                  form.setValue('signingAbility', 'true');
                }}
              >
                {t('decisions:parkingPermit.renewal.form.yes')}
              </RadioButton>
              <RadioButton
                data-cy={`signing-ability-false`}
                size="sm"
                className="mr-sm"
                name={`signing-ability-false`}
                id={`signing-ability-false`}
                value={'false'}
                checked={form.watch('signingAbility') === 'false'}
                onChange={() => {}}
                onClick={() => {
                  form.setValue('signingAbility', 'false');
                }}
              >
                {t('decisions:parkingPermit.renewal.form.no')}
              </RadioButton>
            </RadioButton.Group>
          </div>

          <FormControl>
            <FormLabel htmlFor="expirationDate">{t('decisions:parkingPermit.renewal.form.expiryDateLabel')}</FormLabel>
            <Input
              type="date"
              {...form.register('expirationDate', { required: t('decisions:parkingPermit.renewal.form.dateRequired') })}
              placeholder={t('decisions:parkingPermit.renewal.form.expiryDatePlaceholder')}
            />
            {form.formState.errors.expirationDate && (
              <FormErrorMessage className="text-error">{form.formState.errors.expirationDate.message}</FormErrorMessage>
            )}
          </FormControl>
        </>
      )}
      <FormControl className="w-full">
        <FormLabel>{t('decisions:parkingPermit.renewal.form.attachMedicalCertificate')}</FormLabel>
        <FormHelperText className="mb-12">{t('decisions:parkingPermit.renewal.form.allowedFileTypes')}</FormHelperText>
        {files && files.length > 0 ? (
          <FileUpload.List name="files">
            {files.map((file, i) => (
              <FileUpload.ListItem
                key={file.id}
                index={i}
                file={file}
                categoryProps={{
                  categories: {
                    MEDICAL_CONFIRMATION: t('decisions:parkingPermit.renewal.form.medicalCertificateCategory'),
                  },
                }}
                actionsProps={{
                  showRemove: true,
                  onRemove: () =>
                    form.setValue(
                      'files',
                      form.watch('files').filter((f) => f !== file)
                    ),
                }}
              />
            ))}
          </FileUpload.List>
        ) : (
          <FileUpload.Field
            className="inline-block w-full"
            accept={ACCEPTED_UPLOAD_FILETYPES}
            variant="horizontal"
            name="files"
            maxFileSizeMB={MAX_FILE_SIZE_MB}
            onChange={(e) => {
              form.setValue('files', e.target.value);
            }}
          />
        )}
      </FormControl>
      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
        <Button size="lg" variant="secondary" onClick={() => setFormState('showInfo')}>
          {t('decisions:parkingPermit.renewal.form.cancel')}
        </Button>
        <Button
          size="lg"
          color="vattjom"
          rightIcon={<ArrowRight />}
          type="submit"
          loading={registerErrand.isPending}
          loadingText={t('decisions:parkingPermit.renewal.form.submitting')}
        >
          {t('decisions:parkingPermit.renewal.form.submit')}
        </Button>
      </div>
    </form>
  );
};
