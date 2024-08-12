import { Button, Checkbox, FormControl, FormLabel, Icon } from '@sk-web-gui/react';
import { useState } from 'react';
import { ClientContactSetting } from '../../../interfaces/contactsettings';
import { useApi } from '../../../services/api-service';
import ContentCard, { ContentCardBody, ContentCardHeader } from '../../content-card/content-card';
import { ConnectForm } from '../../form/connect-form.component';
import ContactSettingsFormLogic from './components/contact-settings-form-logic.component';

export const ContactSettings = () => {
  const { data: contactsettings } = useApi<ClientContactSetting>({ url: '/contactsettings', method: 'get' });
  const [isEdit, setIsEdit] = useState(false);

  return (
    <ContentCard>
      <ContentCardHeader>
        <h1 className="text-h4-lg mb-0">
          <div className="flex items-center gap-md">
            <span>Kontaktvägar</span>
          </div>
        </h1>
        <Button
          size="md"
          variant="tertiary"
          showBackground={false}
          leftIcon={<Icon name={isEdit ? 'x' : 'pen'} />}
          onClick={() => setIsEdit((isEdit) => !isEdit)}
        >
          {isEdit ? 'Avbryt' : 'Redigera'}
        </Button>
      </ContentCardHeader>

      <ContentCardBody>
        <ContactSettingsFormLogic onSubmitSuccess={() => setIsEdit(false)} formData={contactsettings}>
          <ConnectForm>
            {({ register }) => (
              <FormControl fieldset>
                <FormLabel className="text-large">Påminnelser och notiser</FormLabel>
                <Checkbox.Group>
                  <Checkbox {...register('notifications.phone_disabled')}>Sms</Checkbox>
                  <Checkbox {...register('notifications.email_disabled')}>E-post</Checkbox>
                </Checkbox.Group>
              </FormControl>
            )}
          </ConnectForm>

          {isEdit && (
            <div className="mt-56">
              <Button type="submit" color="vattjom">
                Spara
              </Button>
            </div>
          )}
        </ContactSettingsFormLogic>
      </ContentCardBody>
    </ContentCard>
  );
};
