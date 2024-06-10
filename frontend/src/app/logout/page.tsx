'use client';

import { useAppContext } from '@contexts/app.context';
import { emptyCaseList } from '@services/case-service';
import { emptyOrganisationInfo } from '@services/organisation-service';
import { emptyUser } from '@services/user-service';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { appURL } from '../../utils/app-url';

export default function Logout() {
  const {
    setIsLoadingCases,
    setChangedCases,
    setUser,
    setRepresentingEntity,
    setCases,
    setHighlightedTableRow,
    setNotificationAlerts,
  } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    setIsLoadingCases(true);
    setChangedCases([]);
    setUser(emptyUser);
    setRepresentingEntity(emptyOrganisationInfo);
    setCases(emptyCaseList);
    setHighlightedTableRow({});
    setNotificationAlerts([]);
    localStorage.clear();
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/saml/logout?successRedirect=${`${appURL()}/login?loggedout`}`); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}
