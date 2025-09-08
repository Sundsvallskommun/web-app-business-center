'use client';

import { ConnectForm } from '@components/form/connect-form.component';
import { ClientContactSetting } from '@interfaces/contactsettings';
import { useApi } from '@services/api-service';
import { Button, Checkbox, FormControl, FormLabel, Icon } from '@sk-web-gui/react';
import { Info, Pen } from 'lucide-react';
import { useState } from 'react';
import ContactSettingsFormLogic from './components/contact-settings-form-logic.component';

export const ContactSettings = () => {
  const { data: contactsettings } = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'get',
    queryKey: ['/contactsettings'],
  });
  const [isEdit, setIsEdit] = useState(false);

  return (
    <div className="px-14 pt-16">
      <ContactSettingsFormLogic onSubmitSuccess={() => setIsEdit(false)} formData={contactsettings}>
        <div>
          <div className="flex flex-col gap-y-40 pb-24">
            <ConnectForm>
              {({ register, watch }) => {
                if (isEdit) {
                  return (
                    <FormControl fieldset>
                      <p className="text-large pb-8">Ändra dina aviseringar</p>
                      <FormLabel>Välj kontaktväg för aviseringar</FormLabel>
                      <Checkbox.Group className="gap-16 pb-16">
                        <Checkbox
                          {...register('notifications.phone_disabled')}
                          data-cy="notification-channel-sms-checkbox"
                          disabled={!watch().phone}
                        >
                          Sms
                        </Checkbox>
                        {!watch().phone ? (
                          <div className="flex items-center gap-6">
                            <Icon size={16} icon={<Info />} className="ml-32 w-4 h-4 shrink-0" />
                            <p className="text-small">
                              För att få aviseringar via sms behöver du lägga till ett mobilnummer.
                            </p>
                          </div>
                        ) : null}
                        <Checkbox
                          {...register('notifications.email_disabled')}
                          data-cy="notification-channel-email-checkbox"
                          disabled={!watch().email}
                          className="mt-8"
                        >
                          E-post
                        </Checkbox>
                        {!watch().email ? (
                          <div className="flex items-center gap-6">
                            <Icon size={16} icon={<Info />} className="ml-32 w-4 h-4 shrink-0" />
                            <p className="text-small">
                              För att få aviseringar via mail behöver du lägga till en e-post.
                            </p>
                          </div>
                        ) : null}
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
                      <p>
                        Vi skickar aviseringar när du till exempel får en ny faktura eller ett nytt meddelande i ett
                        ärende.
                      </p>
                      <p className="font-bold">
                        {contactWaysString
                          ? `Du får just nu aviseringar via ${contactWaysString}`
                          : 'Du får inga aviseringar'}
                      </p>
                    </div>
                  );
                }
              }}
            </ConnectForm>
          </div>

          <ConnectForm>
            {({ reset }) => (
              <div className="flex gap-16">
                {isEdit ? (
                  <>
                    <Button
                      size="md"
                      variant="secondary"
                      showBackground={false}
                      onClick={() => {
                        reset();
                        setIsEdit((isEdit) => !isEdit);
                      }}
                      data-cy="cancel-edit-notification-channel-button"
                    >
                      Avbryt
                    </Button>
                    <Button type="submit" data-cy="save-notification-channel-button">
                      Spara
                    </Button>
                  </>
                ) : (
                  <Button
                    size="md"
                    variant="secondary"
                    showBackground={false}
                    leftIcon={<Icon icon={<Pen />} />}
                    onClick={() => {
                      reset();
                      setIsEdit((isEdit) => !isEdit);
                    }}
                    data-cy="edit-notification-channel-button"
                  >
                    Ändra aviseringar
                  </Button>
                )}
              </div>
            )}
          </ConnectForm>
        </div>
      </ContactSettingsFormLogic>
    </div>
  );
};
