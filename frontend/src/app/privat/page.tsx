'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppContext } from '../../contexts/app.context';
import { getRepresentingModeRoute } from '../../utils/representingModeRoute';

export default function Index() {
  const { representingMode } = useAppContext();
  const router = useRouter();
  useEffect(() => {
    router.push(`${getRepresentingModeRoute(representingMode)}/oversikt`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
}
