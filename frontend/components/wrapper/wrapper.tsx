import { getMe } from '@services/user-service';
import { useEffect } from 'react';
import { useAppContext } from '@contexts/app.context';
import { getCases } from '@services/case-service';
import { getNotes } from '@services/notes-service';
import { getRepresenting } from '@services/organisation-service';
import { getReminders } from '@services/reminder-service';
import { useUpdateEffect } from '@react-hookz/web';
import { defaultContactSettings, getContactSettings, newContactSettings } from '@services/settings-service';
import { useRouter } from 'next/router';
import { getInvoices } from '@services/invoice-service';

export const Wrapper: React.FC<{ tabKey?: string; children?: React.ReactNode }> = ({ children }) => {
  const {
    invoices,
    cases,
    notes,
    reminders,
    setInvoices,
    setCases,
    setNotes,
    setReminders,
    setRepresentingEntity,
    setUser,
    setIsLoadingInvoices,
    setIsLoadingCases,
    setIsLoadingNotes,
    setIsLoadingReminders,
    setContactSettings,
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
            getReminders().then((reminders) => setReminders(reminders));
            getNotes().then((notes) => setNotes(notes));

            getContactSettings().then((contactSettings) => {
              if (contactSettings.error == '404') {
                newContactSettings(defaultContactSettings).then(() => {
                  getContactSettings().then((newFeedbackData) => {
                    setContactSettings(newFeedbackData.settings);
                  });
                });
              } else {
                setContactSettings(contactSettings.settings);
              }
            });
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

  useUpdateEffect(() => {
    setIsLoadingNotes(false);
  }, [notes]);

  useUpdateEffect(() => {
    setIsLoadingReminders(false);
  }, [reminders]);

  return <>{children}</>;
};

export default Wrapper;
