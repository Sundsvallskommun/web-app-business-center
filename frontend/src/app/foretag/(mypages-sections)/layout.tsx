'use client';

import { useEffect, useState } from 'react';
import FullscreenMainSpinner from '../../../components/spinner/fullscreen-main-spinner.component';
import { useAppContext } from '../../../contexts/app.context';
import { RepresentingEntity, RepresentingMode } from '../../../interfaces/app';
import { DefaultLayout } from '../../../layouts/default-layout.component';
import { useApi } from '../../../services/api-service';

export default function Layout({ children }) {
  const { setRepresentingMode, representingMode } = useAppContext();
  const {
    data: representingEntity,
    isLoading: representingIsLoading,
    isFetching: representingIsFetching,
  } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !representingIsLoading && !representingIsFetching) {
      if (representingEntity?.mode !== RepresentingMode.BUSINESS || representingMode !== RepresentingMode.BUSINESS) {
        setRepresentingMode(RepresentingMode.BUSINESS);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, representingIsLoading, representingIsFetching]);

  if (!mounted || representingEntity === undefined || representingEntity.BUSINESS === undefined) {
    return <FullscreenMainSpinner />;
  }

  return <DefaultLayout>{children}</DefaultLayout>;
}
