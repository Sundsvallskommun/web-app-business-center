import { RepresentingEntity, RepresentingMode } from '@/interfaces/representing.interface';
import { getRepresentedIdentifier } from '@/utils/getRepresentedIdentifier';
import { mockOrganizationNumber } from './helpers/constants';
import { mockUser } from './helpers/fixtures';

describe('getRepresentedIdentifier', () => {
  it('returns undefined when there is no representing entity', () => {
    expect(getRepresentedIdentifier(undefined, mockUser)).toBeUndefined();
  });

  it('returns the PRIVATE person number when the private entity is populated', () => {
    const representing = {
      mode: RepresentingMode.PRIVATE,
      PRIVATE: { partyId: 'private-party', name: 'Test', personNumber: '199001012385' },
    } as RepresentingEntity;

    expect(getRepresentedIdentifier(representing, mockUser)).toBe('199001012385');
  });

  it("falls back to the user's own person number in PRIVATE mode before the entity is populated", () => {
    const representing = { mode: RepresentingMode.PRIVATE } as RepresentingEntity;

    expect(getRepresentedIdentifier(representing, mockUser)).toBe(mockUser.personNumber);
  });

  it('returns the BUSINESS organisation number when representing an organisation', () => {
    const representing = {
      mode: RepresentingMode.BUSINESS,
      BUSINESS: { partyId: 'org-party', organizationNumber: mockOrganizationNumber },
    } as unknown as RepresentingEntity;

    expect(getRepresentedIdentifier(representing, mockUser)).toBe(mockOrganizationNumber);
  });

  it('never falls back to the user in BUSINESS mode', () => {
    const representing = { mode: RepresentingMode.BUSINESS } as RepresentingEntity;

    expect(getRepresentedIdentifier(representing, mockUser)).toBeUndefined();
  });

  it('treats an empty identifier as missing', () => {
    const representing = {
      mode: RepresentingMode.BUSINESS,
      BUSINESS: { partyId: 'org-party', organizationNumber: '' },
    } as unknown as RepresentingEntity;

    expect(getRepresentedIdentifier(representing, mockUser)).toBeUndefined();
  });
});
