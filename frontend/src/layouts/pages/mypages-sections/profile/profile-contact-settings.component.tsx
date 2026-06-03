'use client';

import { ConnectForm } from '@components/form/connect-form.component';
import { ClientContactSetting } from '@interfaces/contactsettings';
import { useApi } from '@services/api-service';
import { Button, Checkbox, FormControl, FormLabel, Icon } from '@sk-web-gui/react';
import { Info, Pen } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactSettingsFormLogic from './components/contact-settings-form-logic.component';

export const ContactSettings = () => {
  const { t } = useTranslation('notifications');
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
                const hasPhone = !!watch('phone');
                const hasEmail = !!watch('email');

                if (isEdit) {
                  return (
                    <FormControl fieldset>
                      <p className="text-large pb-8">{t('notifications:changeNotifications')}</p>
                      <FormLabel>{t('notifications:chooseContactMethod')}</FormLabel>
                      <Checkbox
                        disabled={!hasEmail}
                        {...register('notifications.email_enabled')}
                        data-cy="notification-channel-email-checkbox"
                        className="mt-8"
                      >
                        {t('notifications:byEmail')}
                      </Checkbox>
                      {!watch().email ? (
                        <div className="flex items-center gap-6">
                          <Icon size={16} icon={<Info />} className="ml-32 w-4 h-4 shrink-0" />
                          <p className="text-small">{t('notifications:byEmailWarning')}</p>
                        </div>
                      ) : null}
                      <Checkbox.Group className="gap-16 pb-16">
                        <Checkbox
                          disabled={!hasPhone}
                          {...register('notifications.phone_enabled')}
                          data-cy="notification-channel-sms-checkbox"
                        >
                          {t('notifications:bySms')}
                        </Checkbox>
                        {!watch().phone ? (
                          <div className="flex items-center gap-6">
                            <Icon size={16} icon={<Info />} className="ml-32 w-4 h-4 shrink-0" />
                            <p className="text-small">
                              {t('notifications:bySmsWarning')}
                            </p>
                          </div>
                        ) : null}
                      </Checkbox.Group>
                    </FormControl>
                  );
                } else {
                  const contactWaysString =
                    watch('notifications.phone_enabled') && watch('notifications.email_enabled')
                      ? t('notifications:smsAndEmail')
                      : watch('notifications.phone_enabled')
                        ? t('notifications:bySms').toLowerCase()
                        : watch('notifications.email_enabled')
                          ? t('notifications:byEmail').toLowerCase()
                          : '';

                  return (
                    <div className="text-content">
                      <p>
                        {t('notifications:notificationDescription')}
                      </p>
                      <p className="font-bold">
                        {contactWaysString
                          ? t('notifications:contactBy', { methods: contactWaysString })
                          : t('notifications:none')}
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
                      {t('notifications:cancel')}
                    </Button>
                    <Button type="submit" data-cy="save-notification-channel-button">
                      {t('notifications:save')}
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
                    {t('notifications:edit')}
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
