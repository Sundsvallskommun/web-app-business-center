import { GrpInitiateResponseWithStartTime } from '@/interfaces/grp.interface';
import { createHmac } from 'node:crypto';

export class QRGenerator {
  public createQRData(sign: GrpInitiateResponseWithStartTime): string | null {
    try {
      const qrTime = Math.floor((Date.now() - sign.startTime) / 1000).toString();

      const hmac = createHmac('sha256', sign.qrStartSecret);
      hmac.update(qrTime);
      const qrAuthCode = hmac.digest('hex');

      return `bankid.${sign.qrStartToken}.${qrTime}.${qrAuthCode}`;
    } catch (error) {
      console.error(`Error generating QR data: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }
}
