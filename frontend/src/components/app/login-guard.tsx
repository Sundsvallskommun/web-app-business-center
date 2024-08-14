'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User } from '../../interfaces/user';
import { useApi } from '../../services/api-service';
import { useInactivityAlert } from '../../utils/use-inactivity-trigger.hook';

export const LoginGuard: React.FC<{ tabKey?: string; children?: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { error: userError, isFetching: userIsFetching } = useApi<User>({ url: '/me', method: 'get' });

  const handleLogout = () => {
    router.push('/logout');
  };

  useInactivityAlert({
    logoutCallback: handleLogout,
    inactivityCondition: !userIsFetching && !userError && !pathname.includes('login'),
  });

  useEffect(() => {
    if (!userIsFetching && userError && !pathname.includes('login')) {
      router.push(`/login?path=${window.location.pathname}`);
    }
  }, [userIsFetching, userError]);

  return <>{children}</>;
};
