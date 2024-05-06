import Submitbuttons from '@components/button-group/submitbuttons';
import { Disclosure } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import AddIcon from '@mui/icons-material/Add';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CheckIcon from '@mui/icons-material/Check';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import UndoIcon from '@mui/icons-material/Undo';
import { useMessage } from '@sk-web-gui/message';
import { Button, cx, FormControl, FormErrorMessage, FormLabel, Input, Switch } from '@sk-web-gui/react';
import WarnIfUnsavedChanges from '@utils/warnIfUnsavedChanges';
import isEqual from 'lodash/isEqual';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useAppContext } from '../../contexts/app.context';
import {
  Contact,
  ContactChannel,
  defaultContact,
  defaultContactSettings,
  ContactFormModel,
  getContactSettings,
  newContactSettings,
  saveContactSettings,
} from '../../services/settings-service';
import NewContact from './feedback-form-newcontact-modal';

const phonePattern = /^$|^(\+[0-9]{10,12})$/gi;

export const FeedbackForm: React.FC<{
  minimal?: boolean;
  triggerSubmit?: boolean;
  as?: React.ElementType;
  errorCallback?: (error: boolean) => void;
  isChangedCallback?: (isChanged: boolean) => void;
  submitSuccessCallback?: () => void;
}> = ({
  minimal = false,
  triggerSubmit = false,
  as: Comp = minimal ? 'div' : 'form',
  errorCallback = (error) => error,
  isChangedCallback = (isChanged) => isChanged,
  submitSuccessCallback = () => ({}),
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(false);
  const { contactSettings, setContactSettings } = useAppContext();
  const message = useMessage();
  const [formContactSettings, setFormContactSettings] = useState(defaultContactSettings);

  const openContactCardDisclosuresDefault = formContactSettings.contacts.reduce((acc, curr, index) => {
    acc[index] = false;
    return acc;
  }, {});
  const [openContactCardDisclosures, setOpenContactCardDisclosures] = useState(openContactCardDisclosuresDefault);
  const [newContactIndex, setNewContactIndex] = useState<number>();
  const [newContactIsOpen, setNewContactIsOpen] = useState(false);

  const getAllContactMethodsForType = (contactSettings: ContactFormModel, type: string) => {
    return contactSettings.contacts
      .reduce((acc, curr) => {
        acc.push(curr.contactMethods[type]);
        return acc;
      }, [])
      .flat(2);
  };

  const formSchema = yup
    .object({
      contacts: yup.array().of(
        yup.object().shape({
          alias: yup
            .string()
            .required('Kontaktnamnet måste vara minst en karaktär lång')
            .test(
              'duplicate-alias',
              'En kontakt med det namnet finns redan',
              (value) =>
                getValues()
                  .contacts.map((x) => x.alias)
                  .filter((x) => x == value).length !== 2
            ),
          contactMethods: yup.object().shape({
            SMS: yup.array().of(
              yup.object().shape({
                alias: yup.string(),
                destination: yup
                  .string()
                  .trim()
                  .transform((val) => val.replace('-', ''))
                  .matches(phonePattern, 'Ej giltigt telefonnummer')
                  .test(
                    'duplicate-number',
                    'En kontakt med det numret finns redan',
                    (value) =>
                      getAllContactMethodsForType(getValues(), 'SMS').reduce((acc, curr) => {
                        if (curr && curr.destination && curr.destination == value) {
                          acc.push(curr.destination);
                        }
                        return acc;
                      }, []).length !== 2
                  ),
                sendFeedback: yup.bool(),
                contactMethod: yup.string(),
              })
            ),
            EMAIL: yup.array().of(
              yup.object().shape({
                alias: yup.string(),
                destination: yup
                  .string()
                  .trim()
                  .email('Ej giltig e-post')
                  .test(
                    'duplicate-number',
                    'En kontakt med den epostadressen finns redan',
                    (value) =>
                      getAllContactMethodsForType(getValues(), 'EMAIL').reduce((acc, curr) => {
                        if (curr && curr.destination && curr.destination == value) {
                          acc.push(curr.destination);
                        }
                        return acc;
                      }, []).length !== 2
                  ),
                sendFeedback: yup.bool(),
                contactMethod: yup.string(),
              })
            ),
          }),
        })
      ),
    })
    .required();

  const form = useForm<ContactFormModel>({
    resolver: yupResolver(formSchema),
    defaultValues: useMemo(() => {
      return { ...contactSettings };
    }, [contactSettings]),
    mode: 'onChange', // NOTE: Needed if we want to disable submit until valid
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState,
    formState: { errors },
    getValues,
    setError,
    trigger,
  } = form;

  const onSubmit = (data: ContactFormModel) => {
    // Sync eventual changes in contact alias to all its destinations
    // Update destinations with correct alias, alias might been changed
    const aliasMissingDestination: number[] = [];
    data.contacts.forEach((contact, contactIndex) => {
      contact.contactMethods.SMS.forEach((_, i) => {
        data.contacts[contactIndex].contactMethods.SMS[i].alias = contact.alias;
      });
      contact.contactMethods.EMAIL.forEach((_, i) => {
        data.contacts[contactIndex].contactMethods.EMAIL[i].alias = contact.alias;
      });

      // Missing epost and telefonnummer
      const contactMethodsCount = contact.contactMethods.SMS.length + contact.contactMethods.EMAIL.length;
      if (contactMethodsCount == 0) {
        aliasMissingDestination.push(contactIndex);
      }
    });

    // Missing epost and telefonnummer
    if (aliasMissingDestination.length > 0) {
      setFormError(true);
      aliasMissingDestination.forEach((contactIndex) => {
        setError(`contacts.${contactIndex}.alias`, {
          type: 'custom',
          message: 'En kontakt måste ha minst ett telefonnummer eller en e-post angiven',
        });
      });
      return;
    }

    if (isEqual(data, contactSettings)) {
      setFormError(false);
      submitSuccessCallback();
      return;
    }

    setIsLoading(true);
    const apiCall = !contactSettings ? newContactSettings : saveContactSettings;
    apiCall(data).then((r) => {
      if (r) {
        getContactSettings().then((contactSettings) => {
          setContactSettings(contactSettings.settings);
        });
        setNewContactIsOpen(false);
        setNewContactIndex(undefined);
        setIsLoading(false);
        setFormError(false);
        message({
          message: 'Dina kontaktuppgifter har sparats',
          status: 'success',
        });
        submitSuccessCallback();
      } else {
        setFormError(true);
        setIsLoading(false);
      }
    });
  };

  const refreshForm = (data: ContactFormModel) => {
    setFormContactSettings(data);
    reset(data);
  };

  const removeContactMethod = (type: string, newMethods: ContactChannel[], contactIndex: number) => {
    formContactSettings.contacts[contactIndex].contactMethods[type] = newMethods;
    refreshForm(formContactSettings);
  };

  const newContactMethod = (type: string, alias: string, contactIndex) => {
    const data = getValues(); // base on latest data

    if (data.contacts[contactIndex].alias == '') {
      trigger(`contacts.${contactIndex}.alias`);
      return;
    }

    const contactMethod: ContactChannel = {
      alias: alias,
      contactMethod: type,
      destination: '',
      sendFeedback: true,
    };

    const newLength = data.contacts[contactIndex].contactMethods[type].push(contactMethod);

    refreshForm(data);
    setTimeout(() => {
      const elem: HTMLInputElement = document.querySelector(
        `[name='contacts.${contactIndex}.contactMethods.${type}.${newLength - 1}.destination']`
      );
      if (elem) elem.focus();
    }, 100);
  };

  const addContactPerson = () => {
    const data = getValues(); // base on latest data

    const newContact: Contact = defaultContact;

    //:Uses modal for new contact/
    setNewContactIndex(data.contacts.length);
    setNewContactIsOpen(true);

    data.contacts.push(newContact);
    setFormContactSettings(data);
    //:END/

    //:Adds a new row for adding contact/
    // let newLength = data.contacts
    //   .push(
    //     newContact
    //   )
    // refreshForm(data);
    // openContactCardDisclosures[newLength - 1] = true;
    // setOpenContactCardDisclosures(openContactCardDisclosures);
    // setTimeout(()=>{
    //   let elem:HTMLInputElement = document.querySelector(`[name='contacts.${newLength - 1}.alias']`)
    //   if (elem) elem.focus();
    // }, 100)
    //:END/
  };

  const globalNotificationToggleOnChange = (type: string, toggle: boolean) => {
    const _formContactSettings = getValues();
    _formContactSettings.contacts.forEach((contact, _contactIndex) => {
      contact.contactMethods[type].forEach((_, i) => {
        _formContactSettings.contacts[_contactIndex].contactMethods[type][i].sendFeedback = !toggle;
      });
    });
    refreshForm(_formContactSettings);
  };

  const contactGlobalNotificationToggleOnChange = (
    e: React.BaseSyntheticEvent,
    contactIndex: number,
    toggle: boolean
  ) => {
    const _formContactSettings = getValues();
    _formContactSettings.contacts[contactIndex].contactMethods.SMS.forEach((_, i) => {
      _formContactSettings.contacts[contactIndex].contactMethods.SMS[i].sendFeedback = !toggle;
    });
    _formContactSettings.contacts[contactIndex].contactMethods.EMAIL.forEach((_, i) => {
      _formContactSettings.contacts[contactIndex].contactMethods.EMAIL[i].sendFeedback = !toggle;
    });
    refreshForm(_formContactSettings);
  };

  const contactMethodSMS = getAllContactMethodsForType(formContactSettings, 'SMS');
  const contactMethodEMAIL = getAllContactMethodsForType(formContactSettings, 'EMAIL');

  const phoneNumbersAmount = contactMethodSMS.filter((x) => x.sendFeedback == true).length;
  const mailAmount = contactMethodEMAIL.filter((x) => x.sendFeedback == true).length;

  const notificationToggleSMS: boolean = contactMethodSMS.findIndex((x) => x.sendFeedback == true) !== -1;
  const notificationToggleEMAIL: boolean = contactMethodEMAIL.findIndex((x) => x.sendFeedback == true) !== -1;

  useEffect(() => {
    setFormContactSettings(JSON.parse(JSON.stringify(contactSettings)));
  }, [contactSettings]);

  useEffect(() => {
    reset(formContactSettings);
  }, [formContactSettings, reset]);

  // For use within other form with minimal
  useEffect(() => {
    if (triggerSubmit) {
      onSubmit(getValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerSubmit]);

  // For use within other form with minimal
  useEffect(() => {
    errorCallback(Object.keys(errors).length > 0 || (phoneNumbersAmount === 0 && mailAmount === 0));
  }, [errors, formState.isValidating, errorCallback, phoneNumbersAmount, mailAmount]);

  // For use within other form with minimal
  useEffect(() => {
    isChangedCallback(!isEqual(contactSettings, getValues()));
  }, [formState.isDirty, isChangedCallback, contactSettings, getValues]);

  return (
    <FormProvider {...form}>
      <WarnIfUnsavedChanges showWarning={!isEqual(contactSettings, getValues())}>
        <Comp autoComplete="off" className="w-full max-w-[720px]" onSubmit={handleSubmit(onSubmit)}>
          <Input type="hidden" {...register(`id`)} />
          {!minimal && (
            <>
              <h1 className="text-xl">Inställningar för kontaktuppgifter</h1>
              <p>Fyll i telefonnummer och/eller e-post för de som ska få era egna påminnelser skickade till sig. </p>
              {formError && (
                <div className="w-full flex justify-between space-x-2 my-lg">
                  <FormErrorMessage>
                    <span>Det gick inte att hämta/spara inställningar</span>
                  </FormErrorMessage>
                </div>
              )}

              <FormControl id="notifyBy" className="my-lg sm:max-w-2xl">
                <fieldset>
                  <legend>
                    <h3 className="text-base leading-base">Hur ska påminnelser skickas ut?</h3>
                  </legend>
                  <div className="flex flex-row items-center justify-between my-md">
                    <div aria-hidden>SMS till angivna telefonnummer</div>
                    <div className="whitespace-nowrap">
                      <Switch
                        aria-label="SMS"
                        disabled={contactMethodSMS.length < 1}
                        aria-checked={notificationToggleSMS}
                        checked={notificationToggleSMS}
                        className="mx-md"
                        onChange={() => globalNotificationToggleOnChange('SMS', notificationToggleSMS)}
                      />
                      <span aria-hidden>{notificationToggleSMS ? 'På' : 'Av'}</span>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between my-md">
                    <div aria-hidden>Mail till angivna e-postadresser</div>
                    <div className="whitespace-nowrap">
                      <Switch
                        aria-label="Mail"
                        disabled={contactMethodEMAIL.length < 1}
                        aria-checked={notificationToggleEMAIL}
                        checked={notificationToggleEMAIL}
                        className="mx-md"
                        onChange={() => globalNotificationToggleOnChange('EMAIL', notificationToggleEMAIL)}
                      />
                      <span aria-hidden>{notificationToggleEMAIL ? 'På' : 'Av'}</span>
                    </div>
                  </div>
                </fieldset>
              </FormControl>
            </>
          )}
          <Disclosure
            defaultOpen={minimal && phoneNumbersAmount > 0 && mailAmount > 0 ? false : true}
            as="div"
            className={`bg-white py-sm border-b border-gray-stroke`}
          >
            {({ open }) => (
              <>
                <div className="flex">
                  <Disclosure.Button className={cx(`w-full flex justify-between `)}>
                    <div className="flex w-full mr-12 sm:mr-16">
                      <strong className="flex w-full flex-wrap text-base leading-base">
                        <span className="text-left flex-none mr-lg">Vem ska få en påminnelse?</span>
                        <div>
                          <span className="text-left mr-lg">
                            {phoneNumbersAmount}
                            <PhoneOutlinedIcon
                              className="material-icon ml-sm !text-lg align-text-bottom"
                              aria-hidden="true"
                            />
                          </span>
                          <span className="text-left mr-lg">
                            {mailAmount}
                            <EmailOutlinedIcon
                              className="material-icon ml-sm !text-lg align-text-bottom"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                      </strong>
                    </div>
                    <div>
                      {open === true ? (
                        <RemoveIcon className="material-icon !text-2xl text-primary" />
                      ) : (
                        <AddIcon className="material-icon !text-2xl text-primary" />
                      )}
                    </div>
                  </Disclosure.Button>
                </div>
                <Disclosure.Panel>
                  <span className="text-left w-full flex-none">
                    Tänk på att de inställningar du gör här gäller för alla påminnelser som skickas från Mina sidor
                    Företag.
                  </span>
                  {formContactSettings &&
                  formContactSettings.contacts.length &&
                  formContactSettings.contacts.length !== 0 ? (
                    formContactSettings.contacts
                      // .filter((_, i) => i !== newContactIndex) //
                      .map((contact, contactIndex) => {
                        const contactGlobalToggle: boolean =
                          formContactSettings.contacts[contactIndex].contactMethods.SMS.concat(
                            formContactSettings.contacts[contactIndex].contactMethods.EMAIL
                          ).findIndex((x) => x.sendFeedback == true) !== -1;

                        return (
                          <div key={`contacts.${contactIndex}.${contact.alias}`}>
                            <Disclosure
                              defaultOpen={openContactCardDisclosures[contactIndex]}
                              as="div"
                              className={`bg-white ${
                                Object.entries(formContactSettings.contacts).length - 1 !== contactIndex
                                  ? 'border-b border-gray-stroke'
                                  : ''
                              } my-6 py-4`}
                            >
                              {({ open }) => (
                                <>
                                  <div className="flex">
                                    <div className="whitespace-nowrap flex items-center">
                                      <span aria-hidden>{contactGlobalToggle ? 'På' : 'Av'}</span>
                                      <Switch
                                        aria-label={`Påminnelser för ${contact.alias}`}
                                        aria-checked={contactGlobalToggle}
                                        checked={contactGlobalToggle}
                                        disabled={
                                          formContactSettings.contacts[contactIndex].contactMethods.SMS.length < 1 &&
                                          formContactSettings.contacts[contactIndex].contactMethods.EMAIL.length < 1
                                        }
                                        className="ml-2 mr-md"
                                        onChange={(e) =>
                                          contactGlobalNotificationToggleOnChange(e, contactIndex, contactGlobalToggle)
                                        }
                                      />
                                    </div>
                                    <Disclosure.Button
                                      className={cx(`w-full flex justify-between `)}
                                      onClick={() => {
                                        openContactCardDisclosures[contactIndex] =
                                          !openContactCardDisclosures[contactIndex];
                                        setOpenContactCardDisclosures(openContactCardDisclosures);
                                      }}
                                    >
                                      <div className="flex sm:items-center flex-col xs:flex-row w-full mr-6 sm:mr-16">
                                        <h4 className="xs:mr-md text-left text-base inline-block break-words">
                                          {contact.alias}
                                        </h4>
                                        <div className="flex items-center xs:ml-auto">
                                          {formContactSettings.contacts[contactIndex].contactMethods.SMS &&
                                            formContactSettings.contacts[contactIndex].contactMethods.SMS.map(
                                              (x) => x.sendFeedback
                                            ).includes(true) && (
                                              <PhoneOutlinedIcon className="material-icon mr-sm" aria-hidden="true" />
                                            )}
                                          {formContactSettings.contacts[contactIndex].contactMethods.EMAIL &&
                                            formContactSettings.contacts[contactIndex].contactMethods.EMAIL.map(
                                              (x) => x.sendFeedback
                                            ).includes(true) && (
                                              <EmailOutlinedIcon className="material-icon mr-sm" aria-hidden="true" />
                                            )}
                                        </div>
                                      </div>
                                      <div>
                                        <ChevronRightIcon
                                          fontSize="large"
                                          className={cx(`${open ? 'transform -rotate-90' : 'transform rotate-90'}`)}
                                        />
                                      </div>
                                    </Disclosure.Button>
                                  </div>
                                  <Disclosure.Panel>
                                    <div
                                      className={`flex flex-col sm:flex-row p-md bg-background-three  ${
                                        open ? `mt-md` : ``
                                      }`}
                                    >
                                      <div className="grow">
                                        <div>
                                          <FormControl id="name">
                                            <FormLabel>
                                              <strong>Namn</strong>
                                            </FormLabel>
                                            <Fragment key={`contacts.${contactIndex}.alias`}>
                                              <div className="flex items-center w-full relative">
                                                <Input
                                                  style={{ maxWidth: '30rem' }}
                                                  className="mb-sm w-full"
                                                  defaultValue={formContactSettings.contacts[contactIndex]?.alias}
                                                  placeholder="Namn eller referens.."
                                                  {...register(`contacts.${contactIndex}.alias`)}
                                                />
                                              </div>
                                              {errors.contacts?.[contactIndex]?.alias && (
                                                <FormErrorMessage
                                                  key={`contacts.${contactIndex}.alias-errors`}
                                                  id={`contacts.${contactIndex}.alias-errors`}
                                                >
                                                  {errors.contacts?.[contactIndex]?.alias?.message}
                                                </FormErrorMessage>
                                              )}
                                            </Fragment>
                                          </FormControl>
                                        </div>
                                        <div className="mb-md">
                                          <FormControl id="phone">
                                            <FormLabel>
                                              <strong>Telefonnummer</strong>
                                            </FormLabel>
                                            {formContactSettings.contacts[contactIndex].contactMethods.SMS.length ? (
                                              formContactSettings.contacts[contactIndex].contactMethods.SMS.map(
                                                (contactMethodSMS, index) => {
                                                  return (
                                                    <Fragment
                                                      key={`contacts.${contactIndex}.contactMethods.SMS.${index}`}
                                                    >
                                                      <div className="mb-sm flex items-center w-full">
                                                        <div
                                                          className="flex items-center w-full relative"
                                                          style={{ maxWidth: '30rem' }}
                                                        >
                                                          <Input
                                                            className="w-full"
                                                            defaultValue={contactMethodSMS.destination}
                                                            placeholder="+4670..."
                                                            {...register(
                                                              `contacts.${contactIndex}.contactMethods.SMS.${index}.destination`
                                                            )}
                                                          />
                                                          <button
                                                            className="my-sm inline-flex absolute right-3"
                                                            aria-label="Ta bort telefonnummer"
                                                            type="button"
                                                            onClick={() => {
                                                              const newContactMethods = formContactSettings.contacts[
                                                                contactIndex
                                                              ].contactMethods.SMS.filter(
                                                                (item) => item !== contactMethodSMS
                                                              );
                                                              removeContactMethod(
                                                                'SMS',
                                                                newContactMethods,
                                                                contactIndex
                                                              );
                                                            }}
                                                          >
                                                            <DeleteOutlinedIcon className="material-icon mr-sm" />
                                                          </button>
                                                        </div>
                                                        <div className="ml-4 whitespace-nowrap">
                                                          <Switch
                                                            aria-label={`Påminnelser för ${contactMethodSMS.destination}`}
                                                            aria-checked={contactMethodSMS.sendFeedback}
                                                            checked={contactMethodSMS.sendFeedback}
                                                            className="mx-md"
                                                            {...register(
                                                              `contacts.${contactIndex}.contactMethods.SMS.${index}.sendFeedback`
                                                            )}
                                                            onChange={() => {
                                                              formContactSettings.contacts[
                                                                contactIndex
                                                              ].contactMethods.SMS[index].sendFeedback =
                                                                !formContactSettings.contacts[contactIndex]
                                                                  .contactMethods.SMS[index].sendFeedback;
                                                              refreshForm(formContactSettings);
                                                            }}
                                                          />
                                                          <span aria-hidden>
                                                            {watch().contacts?.[contactIndex]?.contactMethods?.SMS?.[
                                                              index
                                                            ]?.sendFeedback
                                                              ? 'På'
                                                              : 'Av'}
                                                          </span>
                                                        </div>
                                                      </div>

                                                      {errors.contacts?.[contactIndex]?.contactMethods?.SMS?.[index]
                                                        ?.destination && (
                                                        <FormErrorMessage
                                                          key={`contacts.${contactIndex}.contactMethods.SMS.${index}-errors`}
                                                        >
                                                          {
                                                            errors.contacts[contactIndex].contactMethods.SMS[index]
                                                              .destination.message
                                                          }
                                                        </FormErrorMessage>
                                                      )}
                                                    </Fragment>
                                                  );
                                                }
                                              )
                                            ) : (
                                              <div className="mb-sm">
                                                Det finns ännu inget telefonnummer registrerat på kontaktpersonen.
                                              </div>
                                            )}
                                            <Button
                                              className="text-body hover:no-underline w-full md:w-auto mt-2 justify-start"
                                              variant="link"
                                              size="lg"
                                              type="button"
                                              onClick={() => {
                                                newContactMethod(
                                                  'SMS',
                                                  formContactSettings.contacts[contactIndex].alias,
                                                  contactIndex
                                                );
                                              }}
                                              leftIcon={
                                                <AddOutlinedIcon
                                                  className="material-icon hover:no-underline mr-sm"
                                                  aria-hidden="true"
                                                />
                                              }
                                            >
                                              <span className="underline">Lägg till ett telefonnummer</span>
                                            </Button>
                                          </FormControl>
                                        </div>
                                        <div className="mb-2">
                                          <FormControl id="email">
                                            <FormLabel>
                                              <strong>E-post</strong>
                                            </FormLabel>
                                            {formContactSettings.contacts[contactIndex].contactMethods.EMAIL.length ? (
                                              formContactSettings.contacts[contactIndex].contactMethods.EMAIL.map(
                                                (contactMethodEMAIL, index) => {
                                                  return (
                                                    <Fragment
                                                      key={`contacts.${contactIndex}.contactMethods.EMAIL.${index}`}
                                                    >
                                                      <div className="mb-sm flex items-center w-full">
                                                        <div
                                                          className="flex items-center w-full relative"
                                                          style={{ maxWidth: '30rem' }}
                                                        >
                                                          <Input
                                                            className="w-full"
                                                            defaultValue={contactMethodEMAIL.destination}
                                                            placeholder="namn.efternamn@mail.se"
                                                            {...register(
                                                              `contacts.${contactIndex}.contactMethods.EMAIL.${index}.destination`
                                                            )}
                                                          />
                                                          <button
                                                            className="my-sm inline-flex absolute right-3"
                                                            aria-label="Ta bort e-post"
                                                            type="button"
                                                            onClick={() => {
                                                              const newContactMethods = formContactSettings.contacts[
                                                                contactIndex
                                                              ].contactMethods.EMAIL.filter(
                                                                (item) => item !== contactMethodEMAIL
                                                              );
                                                              removeContactMethod(
                                                                'EMAIL',
                                                                newContactMethods,
                                                                contactIndex
                                                              );
                                                            }}
                                                          >
                                                            <DeleteOutlinedIcon className="material-icon mr-sm" />
                                                          </button>
                                                        </div>
                                                        <div className="ml-4 whitespace-nowrap">
                                                          <Switch
                                                            aria-label={`Påminnelser för ${contactMethodEMAIL.destination}`}
                                                            aria-checked={contactMethodEMAIL.sendFeedback}
                                                            checked={contactMethodEMAIL.sendFeedback}
                                                            className="mx-md"
                                                            {...register(
                                                              `contacts.${contactIndex}.contactMethods.EMAIL.${index}.sendFeedback`
                                                            )}
                                                            onChange={() => {
                                                              formContactSettings.contacts[
                                                                contactIndex
                                                              ].contactMethods.EMAIL[index].sendFeedback =
                                                                !formContactSettings.contacts[contactIndex]
                                                                  .contactMethods.EMAIL[index].sendFeedback;
                                                              refreshForm(formContactSettings);
                                                            }}
                                                          />
                                                          <span aria-hidden>
                                                            {watch().contacts?.[contactIndex]?.contactMethods?.EMAIL?.[
                                                              index
                                                            ]?.sendFeedback
                                                              ? 'På'
                                                              : 'Av'}
                                                          </span>
                                                        </div>
                                                      </div>
                                                      {errors.contacts?.[contactIndex]?.contactMethods?.EMAIL?.[index]
                                                        ?.destination && (
                                                        <FormErrorMessage
                                                          key={`contacts.${contactIndex}.contactMethods.EMAIL.${index}-errors`}
                                                        >
                                                          {
                                                            errors.contacts[contactIndex].contactMethods.EMAIL[index]
                                                              .destination.message
                                                          }
                                                        </FormErrorMessage>
                                                      )}
                                                    </Fragment>
                                                  );
                                                }
                                              )
                                            ) : (
                                              <div className="mb-sm">
                                                Det finns ännu ingen e-post registrerad på kontaktpersonen.
                                              </div>
                                            )}
                                            <Button
                                              className="text-body hover:no-underline w-full md:w-auto mt-2 justify-start"
                                              variant="link"
                                              size="lg"
                                              type="button"
                                              onClick={() => {
                                                newContactMethod(
                                                  'EMAIL',
                                                  formContactSettings.contacts[contactIndex].alias,
                                                  contactIndex
                                                );
                                              }}
                                              leftIcon={
                                                <AddOutlinedIcon
                                                  className="material-icon hover:no-underline mr-sm"
                                                  aria-hidden="true"
                                                />
                                              }
                                            >
                                              <span className="underline">Lägg till en e-post</span>
                                            </Button>
                                          </FormControl>
                                        </div>
                                      </div>
                                      <div className="mt-10 sm:mt-0">
                                        <Button
                                          className="text-body hover:no-underline w-full md:w-auto mt-2 justify-end"
                                          variant="link"
                                          size="lg"
                                          type="button"
                                          onClick={() => {
                                            const newContacts = formContactSettings.contacts.filter(
                                              (x) => x.alias !== contact.alias
                                            );
                                            formContactSettings.contacts = newContacts;
                                            refreshForm(formContactSettings);
                                            setOpenContactCardDisclosures(openContactCardDisclosuresDefault);
                                          }}
                                          leftIcon={
                                            <DeleteOutlinedIcon
                                              className="material-icon mr-sm hover:no-underline"
                                              aria-hidden="true"
                                            />
                                          }
                                        >
                                          <span className="underline">Ta bort kontakt</span>
                                        </Button>
                                      </div>
                                    </div>
                                  </Disclosure.Panel>
                                </>
                              )}
                            </Disclosure>
                          </div>
                        );
                      })
                  ) : (
                    <div className="mt-2 mb-sm">Inga kontaktpersoner inlagda</div>
                  )}
                  <Button
                    className="w-full mb-8"
                    variant="solid"
                    color="primary"
                    type="button"
                    leftIcon={<AddOutlinedIcon className="material-icon hover:no-underline mr-sm" aria-hidden="true" />}
                    aria-expanded={newContactIsOpen}
                    onClick={() => {
                      addContactPerson();
                    }}
                  >
                    Lägg till en kontaktperson
                  </Button>
                  {newContactIsOpen && newContactIndex !== undefined && (
                    <NewContact
                      isOpen={newContactIsOpen}
                      contactIndex={newContactIndex}
                      formContactSettings={formContactSettings}
                      errors={errors}
                      formError={formError}
                      onSubmit={onSubmit}
                      closeNewContact={() => {
                        setNewContactIsOpen(false);
                        reset(contactSettings);
                        setFormContactSettings(JSON.parse(JSON.stringify(contactSettings)));
                      }}
                      saveNewContact={() => {
                        setNewContactIsOpen(false);
                      }}
                      newContactMethod={newContactMethod}
                      removeContactMethod={removeContactMethod}
                      refreshForm={refreshForm}
                    />
                  )}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          {!minimal && (
            <Submitbuttons>
              <Button
                className="w-full"
                variant="solid"
                type="button"
                disabled={!formState.isDirty && isEqual(contactSettings, getValues())}
                leftIcon={<UndoIcon className="material-icon mr-sm" />}
                onClick={() => {
                  reset(contactSettings);
                  setFormContactSettings(JSON.parse(JSON.stringify(contactSettings)));
                }}
              >
                Återställ
              </Button>
              <Button
                className="w-full"
                variant="solid"
                color="primary"
                type="submit"
                leftIcon={<CheckIcon className="material-icon mr-sm" />}
                disabled={isLoading || !formState.isValid || isEqual(contactSettings, getValues())}
                loading={isLoading}
                loadingText="Sparar"
              >
                Spara ändringar
              </Button>
            </Submitbuttons>
          )}
        </Comp>
      </WarnIfUnsavedChanges>
    </FormProvider>
  );
};
