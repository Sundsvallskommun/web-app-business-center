import { Button, Checkbox, FormControl, FormHelperText, FormLabel, Icon } from '@sk-web-gui/react';
import { useState } from 'react';
import { ClientContactSetting } from '../../../interfaces/contactsettings';
import { useApi } from '../../../services/api-service';
import ContentCard, { ContentCardBody, ContentCardHeader } from '../../content-card/content-card';
import { ConnectForm } from '../../form/connect-form.component';
import ContactSettingsFormLogic from './components/contact-settings-form-logic.component';

const checkboxDescribedbyTextClasses = 'sk-form-checkbox-label ml-24 pl-8 mt-4';

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
          <div className="flex flex-col gap-y-40">
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

            <ConnectForm>
              {({ register }) => (
                <FormControl fieldset>
                  <FormLabel className="text-large">Beslut och dokument</FormLabel>
                  <Checkbox.Group>
                    <>
                      <Checkbox
                        {...register('decicionsAndDocuments.digitalInbox')}
                        aria-describedby="decicionsAndDocuments.digitalInbox-helptext"
                      >
                        <div>Digital brevlåda</div>
                      </Checkbox>
                      <FormHelperText
                        id="decicionsAndDocuments.digitalInbox-helptext"
                        className={checkboxDescribedbyTextClasses}
                      >
                        Brev och fakturor kommer till den digitala brevlådan du är ansluten till.
                      </FormHelperText>
                    </>
                    <>
                      <Checkbox
                        {...register('decicionsAndDocuments.myPages')}
                        aria-describedby="decicionsAndDocuments.myPages-helptext"
                      >
                        <div>Mina sidor</div>
                      </Checkbox>
                      <FormHelperText
                        id="decicionsAndDocuments.myPages-helptext"
                        className={checkboxDescribedbyTextClasses}
                      >
                        Vi mejlar dig när det finns något nytt att läsa eller betala.
                      </FormHelperText>
                    </>
                    <>
                      <Checkbox
                        {...register('decicionsAndDocuments.snailmail')}
                        aria-describedby="decicionsAndDocuments.snailmail-helptext"
                      >
                        <div>Brev</div>
                      </Checkbox>
                      <FormHelperText
                        id="decicionsAndDocuments.snailmail-helptext"
                        className={checkboxDescribedbyTextClasses}
                      >
                        Brev och fakturor kommer hem till dig i brevlådan.
                      </FormHelperText>
                    </>
                  </Checkbox.Group>
                </FormControl>
              )}
            </ConnectForm>
          </div>
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
