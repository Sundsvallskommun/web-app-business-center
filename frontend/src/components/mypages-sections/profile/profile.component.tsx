import { ContactDetails } from './profile-contact-details.component';
import { ContactSettings } from './profile-contact-settings.component';

export const Profile = () => {
  return (
    <div className="flex flex-col gap-40">
      <ContactDetails />
      <ContactSettings />
    </div>
  );
};
