import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '@contexts/app.context';
import { emptyUser } from '@services/user-service';
import { defaultContactSettings } from '@services/settings-service';
import { emptyOrganisationInfo } from '@services/organisation-service';
import { emptyCaseList } from '@services/case-service';
import { emptyReminderList } from '@services/reminder-service';
import { emptyNotesList } from '@services/notes-service';

export default function Start() {
  const {
    setIsLoadingNotes,
    setIsLoadingReminders,
    setIsLoadingCases,
    setChangedCases,
    setContactSettings,
    setUser,
    setRepresentingEntity,
    setCases,
    setHighlightedTableRow,
    setReminders,
    setNotificationAlerts,
    setNotes,
  } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    setIsLoadingNotes(true);
    setIsLoadingReminders(true);
    setIsLoadingCases(true);
    setChangedCases([]);
    setContactSettings(defaultContactSettings);
    setUser(emptyUser);
    setRepresentingEntity(emptyOrganisationInfo);
    setCases(emptyCaseList);
    setHighlightedTableRow({});
    setReminders(emptyReminderList);
    setNotificationAlerts([]);
    setNotes(emptyNotesList);
    router.push('/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}
