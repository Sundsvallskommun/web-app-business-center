'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/app.context';
import { RepresentingEntity, RepresentingMode } from '../../interfaces/app';
import { DefaultLayout } from '../../layouts/default-layout.component';
import { PagesLayout } from '../../layouts/pages-layout.component';
import { useRepresentingSwitch } from '../../layouts/site-menu/site-menu-items';
import { Spinner } from '@sk-web-gui/react';
import { useApi } from '../../services/api-service';

export default function Layout({ children }) {
  const { setRepresentingMode } = useAppContext();
  const { setRepresenting } = useRepresentingSwitch();
  const [mounted, setMounted] = useState(false);
  const { data: representingEntity } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });

  useEffect(() => {
    setRepresenting({ mode: RepresentingMode.PRIVATE });
    setRepresentingMode(RepresentingMode.PRIVATE);
    setMounted(true);
  }, []);

  if (!mounted || representingEntity === undefined || representingEntity.PRIVATE === undefined) {
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
