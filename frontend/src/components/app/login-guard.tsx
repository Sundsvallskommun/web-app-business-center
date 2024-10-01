'use client';

import { useAppContext } from '@contexts/app.context';
import { RepresentingEntity, RepresentingMode } from '@interfaces/app';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User } from '../../interfaces/user';
import { useApi } from '../../services/api-service';
import { useInactivityAlert } from '../../utils/use-inactivity-trigger.hook';

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

  const handleLogout = () => {
    router.push('/logout');
  };

  useInactivityAlert({
    logoutCallback: handleLogout,
    inactivityCondition: !userIsFetching && !userError && !pathname.includes('login'),
  });

  useEffect(() => {
    if (!userIsFetching && userError && !pathname.includes('login')) {
      const path = !window.location.pathname.includes('logout') ? window.location.pathname : '/';
      router.push(`/login?path=${path}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIsFetching, userError]);

  useEffect(() => {
    if (!representingIsLoading && !representingIsFetching) {
      if (representingError && representingMode === RepresentingMode.BUSINESS) {
        router.push(
          `${getRepresentingModeRoute(RepresentingMode.BUSINESS)}/valj-foretag?path=${window.location.pathname}`
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [representingIsLoading, representingIsFetching]);

  return <>{children}</>;
};
