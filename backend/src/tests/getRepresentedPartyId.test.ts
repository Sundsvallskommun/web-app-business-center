import { getRepresentedPartyId } from '@/utils/getRepresentedPartyId';
import { RepresentingEntity, RepresentingMode } from '@/interfaces/representing.interface';
import { mockUser } from './helpers/fixtures';

describe('getRepresentedPartyId', () => {
  it('returns undefined when there is no representing entity', () => {
    expect(getRepresentedPartyId(undefined, mockUser)).toBeUndefined();
  });

  it('returns the PRIVATE partyId when the private entity is populated', () => {
    const representing = {
      mode: RepresentingMode.PRIVATE,
      PRIVATE: { partyId: 'private-party', name: 'Test', personNumber: '199001012385' },
    } as RepresentingEntity;

    expect(getRepresentedPartyId(representing, mockUser)).toBe('private-party');
  });

  it("falls back to the user's own partyId in PRIVATE mode before the entity is populated (e.g. right after login)", () => {
    const representing = { mode: RepresentingMode.PRIVATE } as RepresentingEntity;

    expect(getRepresentedPartyId(representing, mockUser)).toBe(mockUser.partyId);
  });

  it('returns the BUSINESS partyId when representing an organization', () => {
    const representing = {
      mode: RepresentingMode.BUSINESS,
      BUSINESS: { partyId: 'org-party' },
    } as unknown as RepresentingEntity;

    expect(getRepresentedPartyId(representing, mockUser)).toBe('org-party');
  });

  it('returns undefined in BUSINESS mode when no organization is selected (no fallback to the user)', () => {
    const representing = { mode: RepresentingMode.BUSINESS } as RepresentingEntity;

    expect(getRepresentedPartyId(representing, mockUser)).toBeUndefined();
  });
});
