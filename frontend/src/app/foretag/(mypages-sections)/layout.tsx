'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FullscreenMainSpinner from '../../../components/spinner/fullscreen-main-spinner.component';
import { useAppContext } from '../../../contexts/app.context';
import { RepresentingEntity, RepresentingMode } from '../../../interfaces/app';
import { DefaultLayout } from '../../../layouts/default-layout.component';
import { PagesLayout } from '../../../layouts/pages-layout.component';
import { useApi } from '../../../services/api-service';
import { getRepresentingModeRoute } from '../../../utils/representingModeRoute';

export default function Layout({ children }) {
  const { setRepresentingMode, representingMode } = useAppContext();
  const {
    data: representingEntity,
    error: representingError,
    isLoading: representingIsLoading,
    isFetching: representingIsFetching,
  } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!representingIsLoading && !representingIsFetching) {
      if (representingMode !== RepresentingMode.BUSINESS) {
        setRepresentingMode(RepresentingMode.BUSINESS);
      }
      if (
        representingError ||
        (representingMode === RepresentingMode.BUSINESS &&
          representingEntity &&
          representingEntity.BUSINESS === undefined)
      ) {
        router.push(`${getRepresentingModeRoute(RepresentingMode.BUSINESS)}/valj-foretag`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [representingIsLoading, representingIsFetching]);

  if (!mounted || representingEntity === undefined || representingEntity.BUSINESS === undefined) {
    return <FullscreenMainSpinner />;
  }

  return (
    <DefaultLayout>
      <PagesLayout>{children}</PagesLayout>
    </DefaultLayout>
  );
}
