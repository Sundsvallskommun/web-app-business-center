'use client';

import { BankIdSignModal } from '@components/bankid-sign/bankid-sign.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { apiService, useApi } from '@services/api-service';
import { Button, ColorSchemeMode, cx, Modal, useGui, useSnackbar } from '@sk-web-gui/react';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  CreateMandateDto,
  MandateApiResponse,
  RepresentingEntity,
  Sign,
  SignCollect,
  SignMandateDetails,
  SignMandateDto,
} from 'src/data-contracts/backend/data-contracts';
import { SignApiResponse } from '@interfaces/bankid';
import { CreateMandateFormAgreement } from './components/create-mandate-form-agreement.component';
import { CreateMandateFormDates } from './components/create-mandate-form-dates.component';
import { CreateMandateFormGrantee } from './components/create-mandate-form-grantee.component';
import { mandateSchema } from './create-mandate.form';
import { CreateMandateSuccess } from './components/create-mandate-success.component';
import isMobile from 'is-mobile';
import Image from 'next/image';
import { CreateMandateFail } from './components/create-mandate-fail.component';

interface CreateMandateModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateMandateModal: React.FC<CreateMandateModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { data: representingEntity } = useApi<RepresentingEntity>({ url: '/representing', method: 'get' });
  const [saved, setSaved] = useState<boolean>(false);
  const [failCode, setFailCode] = useState<number>(0);
  const [showBankId, setShowBankId] = useState<boolean>(false);
  const [sign, setSign] = useState<Sign | null>(null);
  const isDevice = isMobile({ tablet: true, featureDetect: true });
  const { colorScheme, preferredColorScheme } = useGui();
  const mode = colorScheme === ColorSchemeMode.System ? preferredColorScheme : colorScheme;
  const message = useSnackbar();

  const form = useForm<
    SignMandateDetails & { agree: boolean; name: string },
    unknown,
    SignMandateDetails & { agree: boolean; name: string }
  >({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(mandateSchema) as any,
    defaultValues: {
      activeFrom: dayjs().format('YYYY-MM-DD'),
      inactiveAfter: dayjs().add(3, 'years').format('YYYY-MM-DD'),
      granteeId: '',
      agree: false,
    },
  });
  const { watch, getValues, handleSubmit } = form;

  const initiateBankId = (data: Partial<SignMandateDetails>) => {
    const bankidmessage = `# ${t('profile:mandates.agreement.bankid.title')}\n${t('profile:mandates.agreement.bankid.information', { name: watch('name'), org: representingEntity?.BUSINESS?.organizationName, startdate: watch('activeFrom'), enddate: watch('inactiveAfter') })}\n\n+ ${t('profile:mandates.agreement.bullets.1')}\n+ ${t('profile:mandates.agreement.bullets.2')}\n+ ${t('profile:mandates.agreement.bullets.3')}\n`;
    const visible = Buffer.from(bankidmessage).toString('base64');
    if (data?.granteeId && data?.activeFrom) {
      apiService
        .post<SignApiResponse, SignMandateDto>('/sign/mandate', {
          visible,
          format: 'MARKDOWN',
          mandate: {
            granteeId: data.granteeId,
            activeFrom: data.activeFrom,
            inactiveAfter: data.inactiveAfter,
          },
        })
        .then((response) => {
          setSign(response.data.data);
          setShowBankId(true);
        })
        .catch(() => {
          message({ message: t('bankid:error'), status: 'error' });
        });
    }
  };

  const onSubmit = (data: SignMandateDetails & { agree: boolean }) => {
    initiateBankId(data);
  };

  const createMandate = () => {
    if (sign?.transactionId) {
      apiService
        .post<MandateApiResponse, CreateMandateDto>('/mandates', { transactionId: sign.transactionId })
        .then(() => {
          setSaved(true);
          setSign(null);
        })
        .catch((e: AxiosError) => {
          setSign(null);
          setFailCode(e.status ?? 500);
        });
    }
  };

  const handleCloseBankid = (status?: SignCollect['progressStatus']['status']) => {
    setShowBankId(false);
    switch (status) {
      case 'COMPLETE':
        createMandate();
        break;
      case 'FAILED':
        onClose();
        break;
      default:
        setSign(null);
    }
  };

  return (
    representingEntity?.BUSINESS && (
      <Modal
        className={cx(isDevice ? 'md:max-w-[52rem]' : 'max-w-[52rem]', {
          ['max-md:max-h-[85vh] max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-screen max-md:h-full max-md:rounded-b-0']:
            isDevice,
        })}
        show={open}
        onClose={onClose}
        label={t('profile:mandates.create_new')}
        labelAs={'h1'}
        data-cy="create-mandate-modal"
      >
        <div className="grow overflow-y-auto px-24 -mx-24 flex flex-col">
          {sign && (
            <BankIdSignModal
              data={sign}
              open={showBankId}
              onClose={handleCloseBankid}
              onRenew={() => initiateBankId(getValues())}
            />
          )}
          {saved && <CreateMandateSuccess onClose={onClose} />}
          {failCode > 0 && <CreateMandateFail code={failCode} onClose={onClose} />}

          {!saved && failCode === 0 && (
            <FormProvider {...form}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Content className="flex flex-col gap-32 pb-32 max-h-full py-8 grow">
                  <p>{t('profile:mandates.create_information')}</p>
                  <CreateMandateFormGrantee />
                  <CreateMandateFormDates />
                  <CreateMandateFormAgreement />
                </Modal.Content>
                <Modal.Footer className="flex flex-col md:flex-row">
                  <Button variant="secondary" onClick={onClose} type="reset">
                    {t('profile:cancel')}
                  </Button>
                  <Button data-cy="create-mandate-submit" variant="primary" type="submit" loading={showBankId}>
                    <Image
                      alt="BankID logotyp"
                      src={`/logotypes/bankid_${mode === 'dark' ? 'black' : 'white'}.png`}
                      width="33"
                      height="33"
                      className="w-40"
                    />
                    {t('profile:signWithBankId')}
                  </Button>
                </Modal.Footer>
              </form>
            </FormProvider>
          )}
        </div>
      </Modal>
    )
  );
};
