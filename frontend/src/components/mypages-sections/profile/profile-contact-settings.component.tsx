import { Button, Checkbox, FormControl, FormLabel, Icon } from '@sk-web-gui/react';
import { Pen, X } from 'lucide-react';
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
      <ContactSettingsFormLogic onSubmitSuccess={() => setIsEdit(false)} formData={contactsettings}>
        <ContentCardHeader>
          <ConnectForm>
            {({ reset }) => (
              <>
                <h2 className="text-h4-lg mb-0">
                  <div className="flex items-center gap-md">
                    <span>Kontaktvägar</span>
                  </div>
                </h2>
                <Button
                  size="md"
                  variant="tertiary"
                  showBackground={false}
                  leftIcon={<Icon icon={isEdit ? <X /> : <Pen />} />}
                  onClick={() => {
                    reset();
                    setIsEdit((isEdit) => !isEdit);
                  }}
                >
                  {isEdit ? 'Avbryt' : 'Redigera'}
                </Button>
              </>
            )}
          </ConnectForm>
        </ContentCardHeader>

        <ContentCardBody>
          <div className="flex flex-col gap-y-40">
            <ConnectForm>
              {({ register, watch }) => {
                if (isEdit) {
                  return (
                    <FormControl fieldset>
                      <FormLabel className="text-large">Påminnelser och notiser</FormLabel>
                      <Checkbox.Group>
                        <Checkbox {...register('notifications.phone_disabled')}>Sms</Checkbox>
                        <Checkbox {...register('notifications.email_disabled')}>E-post</Checkbox>
                      </Checkbox.Group>
                    </FormControl>
                  );
                } else {
                  const contactWaysString =
                    watch('notifications.phone_disabled') && watch('notifications.email_disabled')
                      ? 'sms och e-post'
                      : watch('notifications.phone_disabled')
                        ? 'sms'
                        : watch('notifications.email_disabled')
                          ? 'e-post'
                          : '';

                  return (
                    <div className="text-content">
                      <h3 className="text-large font-bold">Påminnelser och notiser</h3>
                      <p>
                        {contactWaysString
                          ? `Du får påminnelser och notiser via ${contactWaysString}`
                          : 'Du får inga påminnelser eller notiser'}
                      </p>
                    </div>
                  );
                }
              }}
            </ConnectForm>
          </div>
          {isEdit && (
            <div className="mt-40">
              <Button type="submit" color="vattjom">
                Spara
              </Button>
            </div>
          )}
        </ContentCardBody>
      </ContactSettingsFormLogic>
    </ContentCard>
  );
};
