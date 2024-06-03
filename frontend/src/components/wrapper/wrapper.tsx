'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { OrganisationInfo } from '../../interfaces/organisation-info';
import { User } from '../../interfaces/user';
import { useApi } from '../../services/api-service';

export const Wrapper: React.FC<{ tabKey?: string; children?: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { error: userError, isFetching: userIsFetching } = useApi<User>({ url: '/me', method: 'get' });
  const { error: representingError, isFetching: representingIsFetching } = useApi<OrganisationInfo>({
    url: '/representing',
    method: 'get',
  });

  useEffect(() => {
    if (!userIsFetching && userError && !pathname.includes('login')) {
      router.push(`/login?path=${window.location.pathname}`);
    } else if (
      !representingIsFetching &&
      representingError &&
      !pathname.includes('/valj-foretag') &&
      !pathname.includes('/login')
    ) {
      router.push('/valj-foretag');
    }
  }, [userIsFetching, userError, representingIsFetching, representingError]);

  return <>{children}</>;
};
