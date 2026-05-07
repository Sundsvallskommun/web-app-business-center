import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/app.context';
import { getRepresentingModeRoute } from '../../utils/representingModeRoute';

export const useBannerMenuItems = () => {
  const { representingMode } = useAppContext();
  const { t } = useTranslation('common');
  const myPagesRoute = getRepresentingModeRoute(representingMode);
  return [
    <NextLink
      key={`banner-menu-item-0`}
      className="w-full flex items-center justify-center"
      href={`${myPagesRoute}/oversikt`}
    >
      {t('common:overview')}
    </NextLink>,
    <NextLink
      key={`banner-menu-item-1`}
      className="w-full flex items-center justify-center"
      href={`${myPagesRoute}/arenden`}
    >
      {t('common:cases')}
    </NextLink>,
    <NextLink
      key={`banner-menu-item-2`}
      className="w-full flex items-center justify-center"
      href={`${myPagesRoute}/beslut-och-dokument`}
    >
      {t('common:decisionsAndDocuments')}
    </NextLink>,
    <NextLink
      key={`banner-menu-item-3`}
      className="w-full flex items-center justify-center"
      href={`${myPagesRoute}/fakturor`}
    >
      {t('common:invoices')}
    </NextLink>,
    <NextLink
      key={`banner-menu-item-4`}
      className="w-full flex items-center justify-center"
      href={`${myPagesRoute}/profil`}
    >
      {t('common:profile')}
    </NextLink>,
  ];
};
