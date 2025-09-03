import { ContactSettingsConfirmation } from '@components/contact-settings-confirmation/contact-settings-confirmation.component';
import { Todos } from './overview/todo/todos.component';

export default function Overview() {
  return (
    <div>
      <Todos />
      <ContactSettingsConfirmation />
    </div>
  );
}
