'use client';

import { useEffect, useState } from 'react';
import FullscreenMainSpinner from '../../components/spinner/fullscreen-main-spinner.component';
import { useAppContext } from '../../contexts/app.context';
import { RepresentingEntity, RepresentingMode } from '../../interfaces/app';
import { DefaultLayout } from '../../layouts/default-layout.component';
import { PagesLayout } from '../../layouts/pages-layout.component';
import { useApi } from '../../services/api-service';
import { useRouter } from 'next/navigation';

export default function Layout({ children }) {
  const { representingMode, setRepresentingMode } = useAppContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const {
    data: representingEntity,
    error: representingError,
    isLoading: representingIsLoading,
    isFetching: representingIsFetching,
  } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });

  useEffect(() => {
    if (!representingIsLoading && !representingIsFetching) {
      if (representingMode !== RepresentingMode.PRIVATE) {
        setRepresentingMode(RepresentingMode.PRIVATE);
      }
      if (representingError) {
        router.push('/login');
      }
    }
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [representingIsLoading, representingIsFetching]);

  if (!mounted || representingEntity === undefined || representingEntity.PRIVATE === undefined) {
    return <FullscreenMainSpinner />;
  }

  return (
    <DefaultLayout>
      <PagesLayout>{children}</PagesLayout>
    </DefaultLayout>
  );
}
