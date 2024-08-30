'use client';

import { RepresentingMode } from '@interfaces/app';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getRepresentingModeRoute } from '../../utils/representingModeRoute';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.push(`${getRepresentingModeRoute(RepresentingMode.PRIVATE)}/oversikt`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
}
