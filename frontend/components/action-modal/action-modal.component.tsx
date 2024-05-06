import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Button, FormControl, FormLabel, Input, Textarea, Switch, FormErrorMessage, Calendar } from '@sk-web-gui/react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  getReminders,
  ReminderFormModel,
  saveReminder,
  editReminder,
  deleteReminder,
} from '../../services/reminder-service';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppContext } from '../../contexts/app.context';
import dayjs from 'dayjs';
import CheckIcon from '@mui/icons-material/Check';
import { useMessage } from '@sk-web-gui/message';
import { deleteNote, editNote, getNotes, saveNote } from '@services/notes-service';
import dayjsLocale from 'dayjs/locale/se';
import CloseIcon from '@mui/icons-material/Close';
import Submitbuttons from '@components/button-group/submitbuttons';
import { FeedbackForm } from '@components/settings-forms/feedback-form';
import isEqual from 'lodash/isEqual';
import WarnIfUnsavedChanges from '@utils/warnIfUnsavedChanges';
import { HelpTooltip } from '@components/tooltip/help-tooltip.component';

const formSchema = yup
  .object({
    caseType: yup.string(),
    note: yup.string().required('Anteckning måste anges'),
    heading: yup.string().required('Rubrik måste anges'),
    doSendReminder: yup.boolean(),
    isReminder: yup.boolean(),
    reminderDate: yup.string().when('isReminder', {
      is: true,
      then: (schema) => schema.required('Datum för notifikation måste anges'),
    }),
    caseId: yup.string(),
    externalCaseId: yup.string(),
    caseLink: yup.string(),
  })
  .required();

const ActionModal: React.FC<{
  isOpen: boolean;
  isEdit?: boolean;
  closeModal: () => void;
  reminder: ReminderFormModel;
}> = ({ isOpen = false, isEdit = false, closeModal, reminder }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [saveContactsTrigger, setSaveContactsTrigger] = useState(false);
  const [saveContactsError, setSaveContactsError] = useState<boolean>(false);
  const [saveContactsIsChanged, setSaveContactsIsChanged] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const initialFocus = useRef(null);
  const message = useMessage();

  const { setNotes, setReminders } = useAppContext();
  const {
    register,
    control,
    watch,
    reset,
    setValue,
    getValues,
    trigger,
    formState,
    formState: { errors },
  } = useForm<ReminderFormModel>({
    resolver: yupResolver(formSchema),
    defaultValues: useMemo(() => {
      return { ...reminder };
    }, [reminder]),
    mode: 'onChange', // NOTE: Needed if we want to disable submit until valid
  });
  const handleOnClose = async () => {
    if (!isEqual(reminder, getValues()) || saveContactsIsChanged) {
      const shouldClose = await window.confirm(
        'Du har osparade ändringar. Är du säker på att du vill lämna den här sidan?'
      );
      if (!shouldClose) return;
    }
    setError(false);
    setIsLoading(false);
    reset();
    closeModal();
  };

  const onSubmit = async (formData: ReminderFormModel) => {
    trigger();
    const noteToReminder = reminder.isReminder == false && formData.isReminder == true;
    if (noteToReminder) {
      deleteNote(reminder.id).then(() => {
        getNotes().then(setNotes);
      });
      isEdit = false;
    }
    const ReminderToNote = reminder.isReminder == true && formData.isReminder == false;
    if (ReminderToNote) {
      deleteReminder(reminder.id).then(() => {
        getReminders().then(setReminders);
      });
      isEdit = false;
    }

    let getData, setData, apiCall, dataBody;
    if (formData.isReminder) {
      // create reminder
      getData = getReminders;
      setData = setReminders;
      apiCall = isEdit ? editReminder : saveReminder;
    } else {
      // create note
      getData = getNotes;
      setData = setNotes;
      apiCall = isEdit ? editNote : saveNote;
    }

    if (isEdit) {
      dataBody = {
        ...formData,
        id: reminder.id,
      };
    } else {
      dataBody = {
        ...formData,
      };
    }
    delete dataBody.isReminder; // only used in form

    setError(false);
    setIsLoading(true);
    apiCall({ ...dataBody }).then((r) => {
      if (r) {
        getData().then(setData);
        setIsLoading(false);
        reset();
        closeModal();
        message({
          message: `Din påminnelse har sparats ${
            formData.isReminder && dayjs(formData.reminderDate).isAfter(dayjs(new Date()))
              ? ' och kommer skickas ' + formData.reminderDate
              : ''
          }`,
          status: 'success',
        });
      } else {
        setError(true);
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    reset(reminder);
  }, [reminder, reset]);

  useEffect(() => {
    if (reminder && watch().isReminder) {
      setValue(
        'reminderDate',
        reminder && reminder.reminderDate ? reminder.reminderDate : dayjs().add(1, 'day').format('YYYY-MM-DD')
      );
    }
  }, [reminder, formState.isDirty, watch, setValue]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        open={isOpen}
        as="div"
        className="fixed inset-0 z-20 overflow-y-auto bg-opacity-50 bg-gray-500"
        onClose={handleOnClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-screen-md px-md py-lg sm:px-16 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded">
              <div className="flex flex-between w-full mb-lg">
                <Dialog.Title as="h4" className={`grow text-xl`}>
                  {isEdit ? 'Redigera' : 'Skapa'} egen påminnelse
                </Dialog.Title>
                <button
                  className="p-4 -m-4"
                  aria-label="Stäng Redigera påminnelse"
                  ref={initialFocus}
                  onClick={() => handleOnClose()}
                >
                  <CloseIcon className="material-icon" />
                </button>
              </div>
              <p>
                Skapa er påminnelse här. Den kommer synas för alla inom företaget som är behöriga att logga in. Ni kan
                även ställa in så att ett meddelande skickas om påminnelsen på ett visst datum.
              </p>

              {reminder && (
                <>
                  <WarnIfUnsavedChanges showWarning={!isEqual(reminder, getValues())}>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        // First Trigger submit in FeedbackForm to check for errors
                        if (watch().isReminder) {
                          setSaveContactsTrigger(true);
                          setTimeout(() => {
                            setSaveContactsTrigger(false);
                          }, 100); // Give react 100ms to respond
                          // Then submitSuccessCallback in Feedbackform will continue reminder submit
                        } else {
                          onSubmit(getValues());
                        }
                      }}
                    >
                      <div className="sm:flex sm:space-x-2 sm:justify-between my-md">
                        <FormControl className="sm:mr-lg">
                          <FormLabel>
                            <strong>Ärende</strong>
                          </FormLabel>
                          <Input disabled placeholder={reminder.caseType} {...register('caseType')} />
                        </FormControl>
                        <FormControl className="mt-md sm:mt-0 sm:ml-lg">
                          <FormLabel>
                            <strong>Ärendenummer</strong>
                          </FormLabel>
                          <Input disabled placeholder={reminder.caseId} {...register('caseId')} />
                        </FormControl>
                        <Input {...register('caseLink')} type="hidden" />
                      </div>

                      <div className="flex space-x-2 my-md">
                        <FormControl id="heading">
                          <FormLabel>
                            <strong>Rubrik</strong>
                          </FormLabel>
                          <Input placeholder={'Påminnelsens rubrik'} {...register('heading')} />
                          {errors.heading && (
                            <FormErrorMessage key={`heading-errors`}>{errors.heading?.message}</FormErrorMessage>
                          )}
                        </FormControl>
                      </div>

                      <div className="flex space-x-2 my-md">
                        <FormControl id="note">
                          <FormLabel>
                            <strong>Anteckningar</strong>
                          </FormLabel>
                          <Controller
                            control={control}
                            name="note"
                            render={({ field: { onChange, value, ref } }) => (
                              <Textarea
                                showCount={true}
                                maxLength={2000}
                                maxLengthWarningText="Max-antalet tecken är 2000"
                                placeholder="Text"
                                rows={6}
                                onChange={onChange} // send value to hook form
                                value={value}
                                ref={ref}
                              />
                            )}
                          />
                          {errors.note && (
                            <FormErrorMessage key={`note-errors`}>{errors.note?.message}</FormErrorMessage>
                          )}
                        </FormControl>
                      </div>

                      <div className="inline-flex flex-row items-center justify-between">
                        <strong aria-hidden>Skicka ut ett meddelande per sms/e-post om påminnelsen</strong>
                        <div className="whitespace-nowrap flex">
                          <Switch
                            aria-label={'Skicka ut ett meddelande per sms/e-post om påminnelsen'}
                            className="mx-md"
                            {...register('isReminder')}
                          />
                          <span aria-hidden className="font-bold">
                            {watch().isReminder ? 'Ja' : 'Nej'}
                          </span>
                        </div>
                      </div>

                      {watch().isReminder && (
                        <>
                          <div className="flex flex-col mt-5 sm:flex-row sm:grid sm:grid-cols-2 sm:gap-10">
                            <div className="w-full">
                              <FormControl id="reminderDate" className="mr-lg">
                                <FormLabel>
                                  <strong>Datum för meddelande </strong>
                                  <span className="text-red-600">*</span>
                                  <HelpTooltip onlyIcon={true} className="!inline-flex z-50" ariaLabel="Hjälptext">
                                    Välj det datum då ni vill få ett meddelande om påminnelsen.
                                  </HelpTooltip>
                                </FormLabel>
                                <Calendar
                                  value={watch().reminderDate}
                                  onChange={(value: string) => {
                                    setValue('reminderDate', value);
                                  }}
                                  localeInstance={dayjsLocale}
                                  inputFormat={'YYYY-MM-DD'}
                                  minDate={dayjs().add(1, 'day').format('YYYY-MM-DD')}
                                />
                                <div className="my-sm">
                                  {errors.reminderDate && (
                                    <FormErrorMessage key={`reminderDate-errors`}>
                                      {errors.reminderDate?.message}
                                    </FormErrorMessage>
                                  )}
                                </div>
                              </FormControl>
                            </div>
                          </div>
                          <div></div>
                          <div className="mt-[40px]">
                            <FeedbackForm
                              minimal
                              triggerSubmit={saveContactsTrigger}
                              errorCallback={(error) => {
                                setSaveContactsError(error);
                              }}
                              isChangedCallback={(isChanged) => {
                                setSaveContactsIsChanged(isChanged);
                              }}
                              submitSuccessCallback={() => {
                                if (saveContactsError) {
                                  setError(true);
                                  return false;
                                } else {
                                  onSubmit(getValues());
                                }
                              }}
                            />
                          </div>
                        </>
                      )}

                      <Submitbuttons>
                        <Button
                          variant="solid"
                          size="lg"
                          leftIcon={!isEdit && <DeleteOutlineIcon fontSize="large" className="mr-sm" />}
                          onClick={handleOnClose}
                          className="w-full"
                          type="button"
                        >
                          Avbryt
                        </Button>
                        <Button
                          type="submit"
                          variant="solid"
                          size="lg"
                          color="primary"
                          className="w-full"
                          leftIcon={<CheckIcon fontSize="large" className="mr-sm" />}
                          loading={isLoading}
                          loadingText="Sparar"
                          disabled={watch().isReminder && saveContactsError}
                        >
                          Spara
                        </Button>
                      </Submitbuttons>
                      {error && (
                        <div className="w-full flex justify-between space-x-2 my-lg mt-xl">
                          <FormErrorMessage>
                            <span>Det gick inte att spara påminnelsen</span>
                          </FormErrorMessage>
                        </div>
                      )}
                    </form>
                  </WarnIfUnsavedChanges>
                </>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ActionModal;
