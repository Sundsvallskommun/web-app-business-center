'use client';

import { useEffect } from 'react';
import { useAppContext } from '../../contexts/app.context';
import { MyPagesMode } from '../../interfaces/app';
import { PagesLayout } from '../../layouts/pages-layout.component';
import { DefaultLayout } from '../../layouts/default-layout.component';

export default function Layout({ children }) {
  const { setMyPagesMode } = useAppContext();

  useEffect(() => {
    setMyPagesMode(MyPagesMode.PRIVATE);
  }, [setMyPagesMode]);

  return (
    <DefaultLayout>
      <PagesLayout>{children}</PagesLayout>
    </DefaultLayout>
  );
}
