import { RepresentingEntity, RepresentingMode } from '../interfaces/representing.interface';

export const getRepresentingPartyId = (representing: RepresentingEntity) => representing[RepresentingMode[representing.mode]].partyId;
