import { User } from '../interfaces/users.interface';
import { RepresentingEntity, RepresentingMode } from '../interfaces/representing.interface';

/**
 * Safely resolve the partyId of the entity the user currently represents.
 *
 * Never throws: it returns `undefined` when no party can be resolved, so each caller
 * can pick the right status code.
 *
 * PRIVATE mode represents the logged-in user themselves. Its session entity is
 * populated lazily (see GET /representing), so right after login the session can hold
 * `{ mode: PRIVATE }` with no PRIVATE entity yet. We fall back to the user's own
 * partyId in that window instead of failing a legitimate request. BUSINESS mode
 * requires an organization that was explicitly selected, so it has no fallback.
 */
export const getRepresentedPartyId = (representing: RepresentingEntity | undefined, user: Pick<User, 'partyId'>): string | undefined => {
  if (!representing) {
    return undefined;
  }

  if (representing.mode === RepresentingMode.PRIVATE) {
    return representing.PRIVATE?.partyId ?? user.partyId ?? undefined;
  }

  return representing.BUSINESS?.partyId ?? undefined;
};
