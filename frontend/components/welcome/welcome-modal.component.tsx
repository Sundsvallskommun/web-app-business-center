import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@sk-web-gui/react';
import Submitbuttons from '@components/button-group/submitbuttons';

export const WelcomeModal: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
}> = ({ isOpen = false, closeModal }) => {
  const initialFocus = useRef(null);

  const handleOnClose = async () => {
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
                    Dina åsikter betyder mycket för oss
                  </Dialog.Title>
                  <button
                    className="p-4 -m-4"
                    aria-label="Stäng välkomstmeddelande"
                    ref={initialFocus}
                    onClick={() => handleOnClose()}
                  >
                    <CloseIcon className="material-icon" />
                  </button>
                </div>
                <p>
                  Mina sidor är en ny tjänst som vi tagit fram för att göra det enklare för dig som företagare. Vi
                  hoppas att du kommer att gilla den. Det här är en första version och vi tar ödmjukt emot dina
                  synpunkter. Testa och låt oss veta vad du tycker!
                </p>
                <Submitbuttons>
                  <Button
                    type="button"
                    variant="solid"
                    size="lg"
                    color="primary"
                    className="w-full"
                    onClick={() => {
                      handleOnClose();
                    }}
                  >
                    Till Mina sidor företag
                  </Button>
                </Submitbuttons>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
