'use client';

import { useAppContext } from '@contexts/app.context';
import { RepresentingEntity, RepresentingMode } from '@interfaces/app';
import { InactivityAlert } from '@components/inactivity-alert/inactivity-alert.component';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect } from 'react';
import { User } from '../../interfaces/user';
import { useApi } from '../../services/api-service';

export const LoginGuard: React.FC<{ tabKey?: string; children?: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { representingMode } = useAppContext();
  const { error: userError, isFetching: userIsFetching } = useApi<User>({ url: '/me', method: 'get' });
  const {
    error: representingError,
    isLoading: representingIsLoading,
    isFetching: representingIsFetching,
  } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });

  const handleLogout = useCallback(() => {
    router.push('/logout');
  }, [router]);

  useEffect(() => {
    if (!userIsFetching && userError && !pathname?.includes('login')) {
      const path = !window.location.pathname.includes('logout') ? window.location.pathname : '/';
      router.push(`/login?path=${path}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIsFetching, userError]);

  useEffect(() => {
    if (!representingIsLoading && !representingIsFetching) {
      if (representingError && representingMode === RepresentingMode.BUSINESS) {
        const path = window.location.pathname.includes('/valj-foretag') ? '/' : window.location.pathname;
        router.push(`${getRepresentingModeRoute(RepresentingMode.BUSINESS)}/valj-foretag?path=${path}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [representingIsLoading, representingIsFetching]);

  return (
    <Suspense>
      {children}
      <InactivityAlert
        onLogout={handleLogout}
        enabled={!userIsFetching && !userError && !pathname?.includes('logout')}
      />
    </Suspense>
  );
};
