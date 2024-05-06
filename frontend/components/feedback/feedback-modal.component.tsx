import { Dialog, Transition } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, FormControl, FormErrorMessage, FormLabel, Textarea, useMessage } from '@sk-web-gui/react';
import WarnIfUnsavedChanges from '@utils/warnIfUnsavedChanges';
import { Fragment, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import isEqual from 'lodash/isEqual';
import CloseIcon from '@mui/icons-material/Close';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { sendFeedback } from '@services/feedback-service';
import Submitbuttons from '@components/button-group/submitbuttons';

interface feedbackFormModel {
  body: string;
}

const formSchema = yup
  .object({
    body: yup.string().required('Anteckning måste anges'),
  })
  .required();

export const FeedbackModal: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
  feedbackForm?: feedbackFormModel;
}> = ({ isOpen = false, closeModal, feedbackForm = { body: '' } }) => {
  const initialFocus = useRef(null);
  const [submitError, setSubmitError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const message = useMessage();

  const {
    control,
    reset,
    getValues,
    formState,
    formState: { errors },
  } = useForm<feedbackFormModel>({
    resolver: yupResolver(formSchema),
    defaultValues: useMemo(() => {
      return { ...feedbackForm };
    }, [feedbackForm]),
    mode: 'onChange', // NOTE: Needed if we want to disable submit until valid
  });

  const onSubmit = (formData: feedbackFormModel) => {
    setIsLoading(true);
    sendFeedback(formData).then((success) => {
      if (success) {
        setSubmitError(false);
        message({
          message: 'Din feedback har skickats',
          status: 'success',
        });
        closeModal();
        reset();
      } else {
        setSubmitError(true);
      }
      setIsLoading(false);
    });
  };

  const handleOnClose = async () => {
    if (!isEqual(feedbackForm, getValues())) {
      const shouldClose = await window.confirm(
        'Du har osparade ändringar. Är du säker på att du vill lämna den här sidan?'
      );
      if (!shouldClose) return;
    }
    reset();
    closeModal();
  };

  return (
    <>
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
                    Tyck till om Mina sidor företag
                  </Dialog.Title>
                  <button
                    className="p-4 -m-4"
                    aria-label="Stäng feedback"
                    ref={initialFocus}
                    onClick={() => handleOnClose()}
                  >
                    <CloseIcon className="material-icon" />
                  </button>
                </div>
                <p>
                  Dina åsikter är viktiga! Genom att tycka till hjälper du oss i vår fortsatta utveckling av tjänsten.
                </p>

                <WarnIfUnsavedChanges showWarning={!isEqual(feedbackForm, getValues())}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSubmit(getValues());
                    }}
                  >
                    <div className="flex my-md">
                      <FormControl id="body">
                        <FormLabel>
                          <strong className="hidden">Feedback</strong>
                        </FormLabel>
                        <Controller
                          control={control}
                          name="body"
                          render={({ field: { onChange, value, ref } }) => (
                            <Textarea
                              showCount={true}
                              maxLength={4000}
                              maxLengthWarningText="Max-antalet tecken är 2000"
                              placeholder="Beskriv vad du tycker"
                              rows={6}
                              onChange={onChange} // send value to hook form
                              value={value}
                              ref={ref}
                            />
                          )}
                        />
                        {errors.body && <FormErrorMessage key={`body-errors`}>{errors.body?.message}</FormErrorMessage>}
                      </FormControl>
                    </div>

                    {submitError && (
                      <div className="flex my-md">
                        <FormErrorMessage key={`feedbackForm-errors`}>
                          Det gick inte att skicka meddelandet
                        </FormErrorMessage>
                      </div>
                    )}
                    <Submitbuttons>
                      <Button
                        type="submit"
                        variant="solid"
                        size="lg"
                        color="primary"
                        className="w-full"
                        leftIcon={<SendOutlinedIcon className="material-icon mr-sm" />}
                        disabled={!formState.isDirty}
                        loading={isLoading}
                        loadingText="Skickar"
                      >
                        Skicka
                      </Button>
                    </Submitbuttons>
                  </form>
                </WarnIfUnsavedChanges>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
