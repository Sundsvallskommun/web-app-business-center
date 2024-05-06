import { Dialog, Transition } from '@headlessui/react';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { ContactChannel, ContactFormModel } from '@services/settings-service';
import { Button, FormControl, FormErrorMessage, FormLabel, Input, Switch } from '@sk-web-gui/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { DeepRequired, FieldErrorsImpl, useFormContext } from 'react-hook-form';

const NewContact: React.FC<{
  isOpen: boolean;
  isEdit?: boolean;
  contactIndex: number;
  formContactSettings: ContactFormModel;
  errors: FieldErrorsImpl<DeepRequired<ContactFormModel>>;
  formError: boolean;
  closeNewContact: () => void;
  saveNewContact: () => void;
  onSubmit: (data: ContactFormModel) => void;
  removeContactMethod: (type: string, newMethods: ContactChannel[], contactIndex: number) => void;
  newContactMethod: (type: string, alias: string, contactIndex) => void;
  refreshForm: (data: ContactFormModel) => void;
}> = ({
  isOpen = false,
  isEdit = false,
  contactIndex,
  formContactSettings,
  errors,
  formError,
  closeNewContact,
  saveNewContact,
  removeContactMethod,
  newContactMethod,
  refreshForm,
}) => {
  const [isLoading] = useState(false);
  const [error, setError] = useState(false);
  const initialFocus = useRef(null);

  const { reset, watch, register, formState } = useFormContext<ContactFormModel>();

  const handleOnClose = async () => {
    if (formState.isDirty) {
      const shouldClose = await window.confirm(
        'Du har osparade ändringar. Är du säker på att du vill lämna den här sidan?'
      );
      if (!shouldClose) return;
    }
    setError(false);
    reset();
    closeNewContact();
  };

  const handleOnSave = () => {
    setError(false);
    saveNewContact();
  };

  // Collect errors from submits
  useEffect(() => {
    setError(formError);
  }, [formError]);

  useEffect(() => {
    reset(formContactSettings);
  }, [formContactSettings, reset]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-20 overflow-y-auto bg-opacity-50 bg-gray-500" onClose={handleOnClose}>
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
            <div className="inline-block w-full max-w-screen-md px-md py-lg sm:px-16 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded">
              <div className="flex flex-between w-full mb-lg">
                <Dialog.Title as="h4" className={`grow text-xl `}>
                  {isEdit ? 'Redigera kontaktperson' : 'Lägg till en kontaktperson'}
                </Dialog.Title>
                <button
                  className="p-4 -m-4"
                  aria-label="Stäng Lägg till en kontaktperson"
                  ref={initialFocus}
                  onClick={() => handleOnClose()}
                >
                  <CloseOutlinedIcon className="material-icon" />
                </button>
              </div>
              {error && (
                <div className="w-full flex justify-between space-x-2 my-lg">
                  <FormErrorMessage>
                    <span>Det gick inte att spara kontaktpersonen</span>
                  </FormErrorMessage>
                </div>
              )}
              <>
                <form
                  id="feedback-form-newContact"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleOnSave();
                  }}
                >
                  <div>
                    <FormControl id="feedback-form-newContact-name">
                      <FormLabel>
                        <strong>Namn</strong>
                      </FormLabel>
                      <Fragment key={`contacts.${contactIndex}.alias`}>
                        <div className="flex items-center w-full relative">
                          <Input
                            // style={{maxWidth: '30rem'}}
                            className="mb-sm w-full"
                            defaultValue={formContactSettings.contacts[contactIndex].alias}
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
                  <div className="flex flex-col mt-5 sm:flex-row sm:grid sm:grid-cols-2 sm:gap-10">
                    <div className="mb-16">
                      <FormControl id="feedback-form-newContact-phone">
                        <FormLabel>
                          <strong>Telefonnummer</strong>
                        </FormLabel>
                        {formContactSettings.contacts[contactIndex].contactMethods.SMS.length ? (
                          formContactSettings.contacts[contactIndex].contactMethods.SMS.map(
                            (contactMethodSMS, index) => {
                              return (
                                <Fragment key={`contacts.${contactIndex}.contactMethods.SMS.${index}`}>
                                  <div className="mb-sm flex items-center w-full">
                                    <div className="flex items-center w-full relative">
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
                                          ].contactMethods.SMS.filter((item) => item !== contactMethodSMS);
                                          removeContactMethod('SMS', newContactMethods, contactIndex);
                                        }}
                                      >
                                        <DeleteOutlineOutlinedIcon className="material-icon mr-sm" aria-hidden="true" />
                                      </button>
                                    </div>
                                    <div className="ml-4 whitespace-nowrap hidden">
                                      <Switch
                                        aria-label={`Påminnelser för ${contactMethodSMS.destination}`}
                                        aria-checked={contactMethodSMS.sendFeedback}
                                        checked={contactMethodSMS.sendFeedback}
                                        className="mx-md hidden"
                                        {...register(
                                          `contacts.${contactIndex}.contactMethods.SMS.${index}.sendFeedback`
                                        )}
                                        onChange={() => {
                                          formContactSettings.contacts[contactIndex].contactMethods.SMS[
                                            index
                                          ].sendFeedback =
                                            !formContactSettings.contacts[contactIndex].contactMethods.SMS[index]
                                              .sendFeedback;
                                          refreshForm(formContactSettings);
                                        }}
                                      />
                                      <span className="hidden" aria-hidden>
                                        {watch().contacts?.[contactIndex]?.contactMethods?.SMS?.[index]?.sendFeedback
                                          ? 'På'
                                          : 'Av'}
                                      </span>
                                    </div>
                                  </div>

                                  {errors.contacts?.[contactIndex]?.contactMethods?.SMS?.[index]?.destination && (
                                    <FormErrorMessage
                                      key={`contacts.${contactIndex}.contactMethods.SMS.${index}-errors`}
                                    >
                                      {errors.contacts[contactIndex].contactMethods.SMS[index].destination.message}
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
                      </FormControl>
                      <Button
                        className="text-body hover:no-underline md:w-auto mt-2"
                        variant="link"
                        size="lg"
                        type="button"
                        onClick={() => {
                          newContactMethod('SMS', formContactSettings.contacts[contactIndex].alias, contactIndex);
                        }}
                        leftIcon={<AddOutlinedIcon className="material-icon mr-sm" aria-hidden="true" />}
                      >
                        <span className="underline">Lägg till ett telefonnummer</span>
                      </Button>
                    </div>
                    <div className="mb-16">
                      <FormControl id="feedback-form-newContact-email">
                        <FormLabel>
                          <strong>E-post</strong>
                        </FormLabel>
                        {formContactSettings.contacts[contactIndex].contactMethods.EMAIL.length ? (
                          formContactSettings.contacts[contactIndex].contactMethods.EMAIL.map(
                            (contactMethodEMAIL, index) => {
                              return (
                                <Fragment key={`contacts.${contactIndex}.contactMethods.EMAIL.${index}`}>
                                  <div className="mb-sm flex items-center w-full">
                                    <div className="flex items-center w-full relative">
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
                                          ].contactMethods.EMAIL.filter((item) => item !== contactMethodEMAIL);
                                          removeContactMethod('EMAIL', newContactMethods, contactIndex);
                                        }}
                                      >
                                        <DeleteOutlineOutlinedIcon className="material-icon mr-sm" aria-hidden="true" />
                                      </button>
                                    </div>
                                    <div className="ml-4 whitespace-nowrap hidden">
                                      <Switch
                                        aria-label={`Påminnelser för ${contactMethodEMAIL.destination}`}
                                        aria-checked={contactMethodEMAIL.sendFeedback}
                                        checked={contactMethodEMAIL.sendFeedback}
                                        className="mx-md hidden"
                                        {...register(
                                          `contacts.${contactIndex}.contactMethods.EMAIL.${index}.sendFeedback`
                                        )}
                                        onChange={() => {
                                          formContactSettings.contacts[contactIndex].contactMethods.EMAIL[
                                            index
                                          ].sendFeedback =
                                            !formContactSettings.contacts[contactIndex].contactMethods.EMAIL[index]
                                              .sendFeedback;
                                          refreshForm(formContactSettings);
                                        }}
                                      />
                                      <span className="hidden" aria-hidden>
                                        {watch().contacts?.[contactIndex]?.contactMethods?.EMAIL?.[index]?.sendFeedback
                                          ? 'På'
                                          : 'Av'}
                                      </span>
                                    </div>
                                  </div>
                                  {errors.contacts?.[contactIndex]?.contactMethods?.EMAIL?.[index]?.destination && (
                                    <FormErrorMessage
                                      key={`contacts.${contactIndex}.contactMethods.EMAIL.${index}-errors`}
                                    >
                                      {errors.contacts[contactIndex].contactMethods.EMAIL[index].destination.message}
                                    </FormErrorMessage>
                                  )}
                                </Fragment>
                              );
                            }
                          )
                        ) : (
                          <div className="mb-sm">Det finns ännu ingen e-post registrerad på kontaktpersonen.</div>
                        )}
                      </FormControl>
                      <Button
                        className="text-body hover:no-underline md:w-auto mt-2"
                        variant="link"
                        size="lg"
                        type="button"
                        onClick={() => {
                          newContactMethod('EMAIL', formContactSettings.contacts[contactIndex].alias, contactIndex);
                        }}
                        leftIcon={<AddOutlinedIcon className="material-icon mr-sm" aria-hidden="true" />}
                      >
                        <span className="underline">Lägg till en e-post</span>
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col mt-5 sm:flex-row sm:grid sm:grid-cols-2 sm:gap-10">
                    <Button
                      type="button"
                      variant="solid"
                      size="lg"
                      leftIcon={!isEdit && <DeleteOutlineOutlinedIcon className="material-icon mr-sm" />}
                      onClick={() => handleOnClose()}
                      className="my-sm sm:my-6 w-full"
                    >
                      Avbryt
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleOnSave()}
                      variant="solid"
                      size="lg"
                      color="primary"
                      leftIcon={<CheckIcon className="material-icon mr-sm" />}
                      className="my-sm sm:my-6 w-full"
                      disabled={
                        isLoading ||
                        Object.keys(errors).length > 0 ||
                        !formState.isDirty ||
                        (formContactSettings.contacts[contactIndex].contactMethods.SMS.length < 1 &&
                          formContactSettings.contacts[contactIndex].contactMethods.EMAIL.length < 1)
                      }
                      loading={isLoading}
                      loadingText={'Sparar'}
                    >
                      Spara
                    </Button>
                  </div>
                </form>
              </>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NewContact;
