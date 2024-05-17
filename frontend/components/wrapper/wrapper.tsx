import { getMe } from '@services/user-service';
import { useEffect } from 'react';
import { useAppContext } from '@contexts/app.context';
import { getCases } from '@services/case-service';
import { getRepresenting } from '@services/organisation-service';
import { useUpdateEffect } from '@react-hookz/web';
import { useRouter } from 'next/router';
import { getInvoices } from '@services/invoice-service';

export const Wrapper: React.FC<{ tabKey?: string; children?: React.ReactNode }> = ({ children }) => {
  const {
    invoices,
    cases,
    setInvoices,
    setCases,
    setRepresentingEntity,
    setUser,
    setIsLoadingInvoices,
    setIsLoadingCases,
  } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    getMe()
      .then((me) => {
        setUser(me);
        getRepresenting()
          .then((representing) => {
            if (!representing.orgNumber) {
              router.push('/valj-foretag');
            }
            setRepresentingEntity(representing);
            getInvoices().then((invoices) => setInvoices(invoices));
            getCases().then((cases) => setCases(cases));
          })
          .catch(() => {
            router.push('/valj-foretag');
          });
      })
      .catch(() => {
        router.push('/login');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useUpdateEffect(() => {
    setIsLoadingInvoices(false);
  }, [invoices]);

  useUpdateEffect(() => {
    setIsLoadingCases(false);
  }, [cases]);

  return <>{children}</>;
};

export default Wrapper;
