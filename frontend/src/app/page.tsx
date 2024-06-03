'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.push('/privat');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
}
