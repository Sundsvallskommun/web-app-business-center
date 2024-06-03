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
