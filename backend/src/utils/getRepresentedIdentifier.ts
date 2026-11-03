import { RepresentingEntity, RepresentingMode } from '@interfaces/representing.interface';
import { User } from '@interfaces/users.interface';

/**
 * Resolve the legal id (personal or organisation number) of the entity the user currently
 * represents, for upstreams keyed on legal id rather than party id.
 */
export const getRepresentedIdentifier = (representing: RepresentingEntity | undefined, user: Pick<User, 'personNumber'>): string | undefined => {
  if (!representing) {
    return undefined;
  }

  if (representing.mode === RepresentingMode.PRIVATE) {
    return representing.PRIVATE?.personNumber || user.personNumber || undefined;
  }

  return representing.BUSINESS?.organizationNumber || undefined;
};
