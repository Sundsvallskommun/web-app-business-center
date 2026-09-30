import { CaseStatusResponse } from '@data-contracts/backend/data-contracts';

type CaseLike = Pick<CaseStatusResponse, 'system' | 'externalCaseId'>;

export const getOpenEErrandUrl = (c?: CaseLike | null): string | null => {
  const baseUrl = process.env.NEXT_PUBLIC_OPEN_E_ERRAND_URL;
  if (!baseUrl?.startsWith('https://') || c?.system !== 'OPEN_E_PLATFORM' || !c.externalCaseId) return null;
  return `${baseUrl}/${encodeURIComponent(c.externalCaseId)}`;
};
