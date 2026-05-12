'use client';

import { apiService } from '@services/api-service';
import { cx, Modal } from '@sk-web-gui/react';
import isMobile from 'is-mobile';
import { useEffect, useRef, useState } from 'react';
import { Sign, SignCollect, SignCollectApiResponse } from '@interfaces/bankid';
import { BankIdFail } from './components/bankid-fail.component';
import { BankIdSignContent } from './components/bankid-sign-content.component';
import { BankIdSignFooter } from './components/bankid-sign-footer.component';

interface BankIdSignModalProps {
  open: boolean;
  data: Sign;
  onClose: (status?: SignCollect['progressStatus']['status']) => void;
  onRenew: () => void;
}

export const INITIAL_TIME = 60 * 5;

export const BankIdSignModal: React.FC<BankIdSignModalProps> = (props) => {
  const { open, onClose, data, onRenew } = props;

  const [qrCode, setQrCode] = useState<string | undefined>();
  const [status, setStatus] = useState<SignCollect['progressStatus']['status'] | undefined>();
  const [hintCode, setHintCode] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [timeSinceStart, setTimeSinceStart] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isDevice = isMobile({ tablet: true, featureDetect: true });

  const [showQrCode, setShowQrCode] = useState<boolean>(!isDevice);

  const cancel = async () => {
    try {
      await apiService.post(`/sign/cancel/${data.transactionId}`);
    } catch {
      console.error('Failed to cancel BankID signing process');
    }
  };

  const handleClose = async (currentstatus?: SignCollect['progressStatus']['status']) => {
    const _status = currentstatus ?? status;
    if (_status === 'PENDING' && data?.transactionId) {
      await cancel();
    }
    clearInterval(intervalRef.current!);
    onClose(_status);
  };

  const renew = async () => {
    clearInterval(intervalRef.current!);
    await cancel();
    onRenew();
  };

  useEffect(() => {
    const stop = async () => {
      clearInterval(intervalRef.current!);
      if (status === 'PENDING' && hintCode === 'outstandingTransaction') {
        await cancel();
        setStatus('FAILED');
        setHintCode('timeout');
      }
    };
    if (!timeLeft) {
      stop();
    } else if (timeSinceStart > 27 && status === 'PENDING' && hintCode === 'outstandingTransaction') {
      renew();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeSinceStart, timeLeft]);

  const handleRenew = () => {
    setQrCode(undefined);
    setHintCode(null);
    setStatus(undefined);
    setTimeLeft(INITIAL_TIME);
    onRenew();
  };

  const checkStatus = () => {
    if (data?.transactionId) {
      apiService
        .get<SignCollectApiResponse>('/sign/' + data.transactionId)
        .then(async (response) => {
          const data = response.data.data;
          setStatus(data.progressStatus.status);
          setHintCode(data.progressStatus.substatus);
          if (data.progressStatus.status === 'PENDING' && data.progressStatus.substatus === 'outstandingTransaction') {
            setQrCode(data.qrCode);
          } else {
            setQrCode(undefined);
          }
          if (data.progressStatus.status === 'COMPLETE') {
            setQrCode(undefined);
            clearInterval(intervalRef.current!);
            handleClose('COMPLETE');
          }
          if (data.progressStatus.status === 'FAILED') {
            setQrCode(undefined);
            clearInterval(intervalRef.current!);
          }
        })
        .catch(() => {
          setStatus('FAILED');
          setHintCode(null);
        });
    }
  };

  useEffect(() => {
    if (open && data.transactionId) {
      setTimeSinceStart(0);
      setStatus('PENDING');
      setQrCode(data.qrCode);
      intervalRef.current = setInterval(() => {
        checkStatus();
        setTimeLeft((time) => time - 1);
        setTimeSinceStart((time) => time + 1);
      }, 1000);
    }
    return () => {
      clearInterval(intervalRef.current!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data.transactionId]);

  return (
    <Modal
      data-cy="bankid-sign-modal"
      className={cx('w-full max-h-full', 'bg-background-100', {
        ['bg-error-background-100']: status === 'FAILED',
        ['sm:max-w-[52rem] md:mx-0']: !isDevice,
        ['max-md:w-screen max-md:h-screen max-md:-ml-16 max-md:-mr-16 max-md:rounded-0']: isDevice,
      })}
      show={open && !!data}
      onClose={handleClose}
    >
      {status === 'FAILED' ? (
        <BankIdFail onClose={handleClose} onRetry={handleRenew} hintCode={hintCode} />
      ) : (
        <>
          <BankIdSignContent showQrCode={showQrCode} qrCode={qrCode} timeLeft={timeLeft} hintCode={hintCode} />
          <BankIdSignFooter data={data} onShowQrCode={setShowQrCode} />
        </>
      )}
    </Modal>
  );
};
