'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppContext } from '../../contexts/app.context';
import { getMyPagesModeRoute } from '../../utils/pagesModeRoute';

export default function Index() {
  const { myPagesMode } = useAppContext();
  const router = useRouter();
  useEffect(() => {
    router.push(`${getMyPagesModeRoute(myPagesMode)}/oversikt`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
}
