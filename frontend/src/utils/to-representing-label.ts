import { RepresentingEntity, RepresentingMode } from '@interfaces/app';

export const toRepresentingLabel = (representingEntity?: RepresentingEntity): string | undefined => {
  return representingEntity?.mode === RepresentingMode.BUSINESS
    ? representingEntity?.BUSINESS?.organizationName
    : representingEntity?.PRIVATE?.name;
};
