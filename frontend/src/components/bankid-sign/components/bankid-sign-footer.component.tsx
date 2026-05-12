import { Sign } from '@interfaces/bankid';
import { Button, ColorSchemeMode, Modal, useGui } from '@sk-web-gui/react';
import isMobile from 'is-mobile';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface BankIdSignFooterProps {
  data?: Sign;
  onShowQrCode: (show: boolean) => void;
}

export const BankIdSignFooter: React.FC<BankIdSignFooterProps> = ({ data, onShowQrCode }) => {
  const isDevice = isMobile({ tablet: true, featureDetect: true });
  const { t } = useTranslation();
  const { colorScheme, preferredColorScheme } = useGui();
  const mode = colorScheme === ColorSchemeMode.System ? preferredColorScheme : colorScheme;
  const deviceLink = `https://app.bankid.com/?autostarttoken=${data?.autoStartToken}`;
  const desktopLink = `bankid:///?autostarttoken=${data?.autoStartToken}`;

  return (
    <Modal.Footer className="w-full flex flex-col md:flex-row justify-center text-center">
      {isDevice ? (
        <>
          <a
            className="sk-btn sk-btn-md sk-btn-primary"
            data-color="primary"
            href={isDevice ? deviceLink : desktopLink}
          >
            <Image
              alt="BankID logotyp"
              src={`/logotypes/bankid_${mode === 'dark' ? 'black' : 'white'}.png`}
              width="40"
              height="33"
              className="w-40"
            />{' '}
            {t('bankid:open_on_this_device')}
          </a>
          <Button variant="secondary" onClick={() => onShowQrCode(true)}>
            {t('bankid:use_other_device')}
          </Button>
        </>
      ) : (
        <a className="sk-btn sk-btn-md sk-btn-secondary" href={isDevice ? deviceLink : desktopLink}>
          <Image
            alt="BankID logotyp"
            src={`/logotypes/bankid_${mode === 'dark' ? 'white' : 'black'}.png`}
            width="40"
            height="33"
            className="w-40"
          />{' '}
          {t('bankid:open_on_this_device')}
        </a>
      )}
    </Modal.Footer>
  );
};
