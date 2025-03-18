import { RepresentingMode } from '../interfaces/app';

export const isBusinessMode = (mode: RepresentingMode) => mode === RepresentingMode.BUSINESS;
export const isPrivateMode = (mode: RepresentingMode) => mode === RepresentingMode.PRIVATE;

export const getAdjustedPathname = (path: string, representingMode: RepresentingMode) => {
  return path.startsWith(getRepresentingModeRoute(RepresentingMode.BUSINESS)) ||
    path.startsWith(getRepresentingModeRoute(RepresentingMode.PRIVATE))
    ? newRepresentingModePathname(representingMode, path)
    : path === '/'
      ? getRepresentingModeRoute(representingMode)
      : path;
};

export const getSwitchedRepresentingMode = (representingMode: RepresentingMode) =>
  representingMode === RepresentingMode.BUSINESS ? RepresentingMode.PRIVATE : RepresentingMode.BUSINESS;

export const getRepresentingModeName = (representingMode: RepresentingMode, options = { urlFriendly: false }) => {
  switch (representingMode) {
    case RepresentingMode.PRIVATE:
      return 'privat';
    case RepresentingMode.BUSINESS:
      return options.urlFriendly ? 'foretag' : 'företag';
    default:
      return '';
  }
};

export const getRepresentingModeRoute = (representingMode: RepresentingMode) => {
  switch (representingMode) {
    case RepresentingMode.PRIVATE:
      return `/${getRepresentingModeName(RepresentingMode.PRIVATE, { urlFriendly: true })}`;
    case RepresentingMode.BUSINESS:
      return `/${getRepresentingModeName(RepresentingMode.BUSINESS, { urlFriendly: true })}`;
    default:
      return '';
  }
};

const myPagesRegex = new RegExp(
  getRepresentingModeRoute(RepresentingMode.PRIVATE) + '|' + getRepresentingModeRoute(RepresentingMode.BUSINESS),
  'gi'
);

export const getRepresentingMode = (
  pathname: string = window.location.pathname.toString()
): RepresentingMode | null => {
  if (pathname.match(getRepresentingModeRoute(RepresentingMode.PRIVATE)) !== null) return RepresentingMode.PRIVATE;
  if (pathname.match(getRepresentingModeRoute(RepresentingMode.BUSINESS)) !== null) return RepresentingMode.BUSINESS;
  return null;
};
export const newRepresentingModePathname = (
  newMode: RepresentingMode,
  pathname = window.location.pathname.toString()
) => `${pathname.replace(myPagesRegex, getRepresentingModeRoute(newMode) || '')}`;
