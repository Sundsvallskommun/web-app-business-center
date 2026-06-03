import { Errand, ErrandChannelEnum } from '@/data-contracts/case-data/data-contracts';

// This BFF is the businesses' "Mina sidor", so every errand it creates in
// CaseData originates from that channel. Stamping it in one place keeps the
// attribution consistent.
export function buildMyPagesErrand(errand: Omit<Errand, 'channel'>): Errand {
  return {
    ...errand,
    channel: ErrandChannelEnum.MY_PAGES,
  };
}
