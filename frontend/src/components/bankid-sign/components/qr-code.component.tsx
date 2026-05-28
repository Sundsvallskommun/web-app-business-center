'use client';

import { useEffect, useState } from 'react';
import QRLib from 'qrcode';

import type { QRCodeToDataURLOptions } from 'qrcode';
import Image from 'next/image';
import { Modal } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

const qrCodeOptions: QRCodeToDataURLOptions = {
  width: 200,
  margin: 3,
  errorCorrectionLevel: 'L',
};

interface QRCodeProps {
  qrCode: string;
}

export const QRCode: React.FC<QRCodeProps> = ({ qrCode }) => {
  const [image, setImage] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    QRLib.toDataURL(qrCode, qrCodeOptions)
      .then((url: string) => {
        setImage(url);
      })
      .catch(() => {
        setImage(null);
      });
  }, [qrCode]);

  if (!image) {
    return null;
  }
  return (
    <>
      <Modal show={fullscreen} onClose={() => setFullscreen(false)} className="max-h-full max-w-full">
        <Image width={1200} height={1200} src={image} alt={t('bankid:qrCode')} className="max-w-full max-h-full" />
      </Modal>
      <button className="focus-visible:ring ring-ring" onClick={() => setFullscreen(true)}>
        <Image width={200} height={200} src={image} alt={`${t('bankid:qrCode')} ${t('bankid:clickToExpand')}`} />
      </button>
    </>
  );
};
