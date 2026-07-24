import { RepresentingEntity, RepresentingMode } from '../interfaces/representing.interface';

export const getRepresentingPartyId = (representing: RepresentingEntity): string => {
  const entity = representing.mode === RepresentingMode.BUSINESS ? representing.BUSINESS : representing.PRIVATE;
  if (!entity) {
    throw new Error('Representing entity missing for the selected mode');
  }
  return entity.partyId;
};
