import NextLink from 'next/link';
import { useAppContext } from '../../contexts/app.context';
import { getRepresentingModeRoute } from '../../utils/representingModeRoute';

export const useBannerMenuItems = () => {
  const { representingMode } = useAppContext();
  const myPagesRoute = getRepresentingModeRoute(representingMode);
  return [
    <NextLink className="w-full flex items-center justify-center" href={`${myPagesRoute}/oversikt`}>
      Översikt
    </NextLink>,
    <NextLink className="w-full flex items-center justify-center" href={`${myPagesRoute}/arenden`}>
      Ärenden
    </NextLink>,
    <NextLink className="w-full flex items-center justify-center" href={`${myPagesRoute}/fakturor`}>
      Fakturor
    </NextLink>,
    <NextLink className="w-full flex items-center justify-center" href={`${myPagesRoute}/profil`}>
      Profil och inställningar
    </NextLink>,
  ];
};
