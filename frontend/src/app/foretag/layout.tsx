'use client';

import { Spinner } from '@sk-web-gui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/app.context';
import { RepresentingEntity, RepresentingMode } from '../../interfaces/app';
import { DefaultLayout } from '../../layouts/default-layout.component';
import { PagesLayout } from '../../layouts/pages-layout.component';
import { useRepresentingSwitch } from '../../layouts/site-menu/site-menu-items';
import { useApi } from '../../services/api-service';

export default function Layout({ children }) {
  const { setRepresentingMode, representingMode } = useAppContext();
  const { setRepresenting } = useRepresentingSwitch();
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
    if (representingMode !== RepresentingMode.BUSINESS) {
      setRepresentingMode(RepresentingMode.BUSINESS);
    }
    if (!representingIsLoading && !representingIsFetching) {
      if (representingEntity && representingEntity.mode !== RepresentingMode.BUSINESS) {
        setRepresenting({ mode: RepresentingMode.BUSINESS });
      }
      if (
        representingError ||
        (representingMode === RepresentingMode.BUSINESS &&
          representingEntity &&
          representingEntity.BUSINESS === undefined)
      ) {
        router.push(`/valj-foretag`);
      }
    }
  }, [representingMode, representingIsLoading, representingIsFetching]);

  if (!mounted || representingEntity === undefined || representingEntity.BUSINESS === undefined) {
    return (
      <main>
        <div className="w-screen h-screen flex items-center justify-center">
          <Spinner aria-label="Laddar information" />
        </div>
      </main>
    );
  }

  return (
    <DefaultLayout>
      <PagesLayout>{children}</PagesLayout>
    </DefaultLayout>
  );
}
