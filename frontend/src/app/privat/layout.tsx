'use client';

import { useEffect, useState } from 'react';
import FullscreenMainSpinner from '../../components/spinner/fullscreen-main-spinner.component';
import { useAppContext } from '../../contexts/app.context';
import { RepresentingEntity, RepresentingMode } from '../../interfaces/app';
import { DefaultLayout } from '../../layouts/default-layout.component';
import { useApi } from '../../services/api-service';

export default function Layout({ children }) {
  const { representingMode, setRepresentingMode } = useAppContext();
  const [mounted, setMounted] = useState(false);
  const {
    data: representingEntity,
    isLoading: representingIsLoading,
    isFetching: representingIsFetching,
  } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !representingIsLoading && !representingIsFetching) {
      if (representingEntity?.mode !== RepresentingMode.PRIVATE || representingMode !== RepresentingMode.PRIVATE) {
        setRepresentingMode(RepresentingMode.PRIVATE);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, representingIsLoading, representingIsFetching]);

  if (!mounted || representingEntity === undefined || representingEntity.PRIVATE === undefined) {
    return <FullscreenMainSpinner />;
  }

  return <DefaultLayout>{children}</DefaultLayout>;
}
