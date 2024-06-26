import { RepresentingMode } from '../interfaces/app';

export const getRepresentingModeRoute = (representingMode: RepresentingMode) => {
  switch (representingMode) {
    case RepresentingMode.PRIVATE:
      return '/privat';
    case RepresentingMode.BUSINESS:
      return '/foretag';
    default:
      return '';
  }
};

var myPagesRegex = new RegExp(
  getRepresentingModeRoute(RepresentingMode.PRIVATE) + '|' + getRepresentingModeRoute(RepresentingMode.BUSINESS),
  'gi'
);

export const getRepresentingMode = (pathname: string): RepresentingMode | null => {
  if (pathname.match(getRepresentingModeRoute(RepresentingMode.PRIVATE)) !== null) return RepresentingMode.PRIVATE;
  if (pathname.match(getRepresentingModeRoute(RepresentingMode.BUSINESS)) !== null) return RepresentingMode.BUSINESS;
  return null;
};
export const newRepresentingModePathname = (
  newMode: RepresentingMode,
  pathname = window.location.pathname.toString()
) => `${pathname.replace(myPagesRegex, getRepresentingModeRoute(newMode) || '')}`;
