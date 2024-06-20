import { MyPagesMode } from '../interfaces/app';

export const getMyPagesModeRoute = (myPagesMode: MyPagesMode) => {
  switch (myPagesMode) {
    case MyPagesMode.PRIVATE:
      return '/privat';
    case MyPagesMode.BUSINESS:
      return '/foretag';
    default:
      return '';
  }
};

var myPagesRegex = new RegExp(
  getMyPagesModeRoute(MyPagesMode.PRIVATE) + '|' + getMyPagesModeRoute(MyPagesMode.BUSINESS),
  'gi'
);
export const getMyPagesMode = (pathname: string): MyPagesMode | null => {
  if (pathname.match(getMyPagesModeRoute(MyPagesMode.PRIVATE)) !== null) return MyPagesMode.PRIVATE;
  if (pathname.match(getMyPagesModeRoute(MyPagesMode.BUSINESS)) !== null) return MyPagesMode.BUSINESS;
  return null;
};
export const newMyPagesModePathname = (newMode: MyPagesMode, pathname = window.location.pathname.toString()) =>
  `${pathname.replace(myPagesRegex, getMyPagesModeRoute(newMode) || '')}`;
