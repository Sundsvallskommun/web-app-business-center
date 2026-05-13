import { ColorSchemeMode, Modal, cx, useGui } from '@sk-web-gui/react';
import isMobile from 'is-mobile';
import Image from 'next/image';
import { INITIAL_TIME } from '../bankid-sign.component';
import { QRCode } from './qr-code.component';
import { TimeLeft } from './timeleft.component';
import { useTranslation } from 'react-i18next';

interface BankIdSignContentProps {
  hintCode: string | null;
  showQrCode?: boolean;
  qrCode?: string;
  timeLeft: number;
}

export const BankIdSignContent: React.FC<BankIdSignContentProps> = ({ hintCode, showQrCode, qrCode, timeLeft }) => {
  const isDevice = isMobile({ tablet: true, featureDetect: true });
  const { t } = useTranslation();
  const type = isDevice ? 'mobile' : 'desktop';
  const { colorScheme, preferredColorScheme } = useGui();
  const mode = colorScheme === ColorSchemeMode.System ? preferredColorScheme : colorScheme;

  return (
    <Modal.Content className={cx('w-full flex flex-col items-center h-full grow -mt-24')}>
      <header className="w-full flex flex-col items-start text-left mb-16">
        <h1
          className={cx(
            hintCode === 'outstandingTransaction' || !hintCode ? 'text-h2-sm md:text-h2-md' : 'text-label-large'
          )}
        >
          {t(hintCode ? `bankid:hintcode.${type}.${hintCode}` : 'bankid:hintcode.none')}
        </h1>
      </header>
      {showQrCode && qrCode && timeLeft > 0 && (
        <>
          <p>{t('bankid:qrCodeHelp')}</p>
          <div className="flex flex-col gap-0">
            <QRCode qrCode={qrCode} />
            <TimeLeft time={timeLeft} maxTime={INITIAL_TIME} />
          </div>
        </>
      )}
      {(hintCode === 'started' || hintCode === 'userSign' || hintCode === 'processing') && (
        <Image alt="BankID logotyp" src={`/logotypes/bankid_blue_${mode}.png`} width="310" height="256" />
      )}
    </Modal.Content>
  );
};
