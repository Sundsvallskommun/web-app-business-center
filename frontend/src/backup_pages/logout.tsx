import { useAppContext } from '@contexts/app.context';
import { emptyCaseList } from '@services/case-service';
import { emptyOrganisationInfo } from '@services/organisation-service';
import { emptyUser } from '@services/user-service';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Start() {
  const {
    setIsLoadingCases,
    setChangedCases,
    setUser,
    setRepresentingEntity,
    setCases,
    setHighlightedTableRow,
    setNotificationAlerts,
  } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    setIsLoadingCases(true);
    setChangedCases([]);
    setUser(emptyUser);
    setRepresentingEntity(emptyOrganisationInfo);
    setCases(emptyCaseList);
    setHighlightedTableRow({});
    setNotificationAlerts([]);
    router.push('/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}
