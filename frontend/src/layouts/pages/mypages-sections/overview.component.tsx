import { ContactSettingsConfirmation } from '@components/contact-settings-confirmation/contact-settings-confirmation.component';
import { Announcements } from './overview/announcements.component';
import { Todos } from './overview/todo/todos.component';

export default function Overview() {
  return (
    <div>
      <Todos />
      <Announcements />
      <ContactSettingsConfirmation />
    </div>
  );
}
