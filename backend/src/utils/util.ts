import { API_BASE_URL } from '@config';

export const apiURL = (...parts: string[]): string => {
  const urlParts = [API_BASE_URL, ...parts];
  return urlParts.map(pathPart => (pathPart ?? '').replace(/(^\/|\/$)/g, '')).join('/');
};

const luhnCheck = (str = ''): boolean => {
  str = str.length === 12 ? str.slice(2) : str;
  let sum = 0;
  for (let i = 0, l = str.length; i < l; i++) {
    let v = parseInt(str[i]);
    v *= 2 - (i % 2);
    if (v > 9) {
      v -= 9;
    }
    sum += v;
  }
  return sum % 10 === 0;
};

enum OrgNumberFormat {
  DASH,
}

export const formatOrgNr = (orgNr: string, format: OrgNumberFormat = OrgNumberFormat.DASH): string | null | undefined => {
  if (!orgNr) {
    return null;
  }
  const orgNumber = orgNr?.replace(/\D/g, '');
  if (!orgNumber || !luhnCheck(orgNumber)) {
    return; // NOTE: incorrect org number
  }
  if (orgNr.length == 10) {
    return format === OrgNumberFormat.DASH ? orgNumber.substring(0, 6) + '-' + orgNumber.substring(6, 10) : orgNumber;
  }
  if (orgNr.length == 12) {
    return format === OrgNumberFormat.DASH ? orgNumber.substring(2, 8) + '-' + orgNumber.substring(8, 12) : orgNumber;
  }
  return null;
};

export const isValidUrl = (string: string) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};
