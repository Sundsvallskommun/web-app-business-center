'use client';

import { useAppContext } from '@contexts/app.context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { appURL } from '../../utils/app-url';

export default function Logout() {
  const { resetContextDefaults } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    resetContextDefaults();
    localStorage.clear();
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/saml/logout?successRedirect=${`${appURL()}/login?loggedout`}`); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}
