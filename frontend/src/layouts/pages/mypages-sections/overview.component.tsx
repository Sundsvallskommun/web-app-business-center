import { ContactSettingsConfirmation } from '@components/contact-settings-confirmation/contact-settings-confirmation.component';
import { Announcements } from './overview/announcements.component';
import ExternalMinaSidor from './overview/external-minasidor.component';
import { Todos } from './overview/todo/todos.component';

export default function Overview() {
  return (
    <div>
      <Todos />
      <Announcements />
      <ExternalMinaSidor />
      <ContactSettingsConfirmation />
    </div>
  );
}
