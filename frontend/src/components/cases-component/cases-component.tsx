import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { cx } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';

export const CasesComponent: React.FC<{
  header;
  children;
  helpText;
  disclosureIsOpen?: boolean;
  setDisclosureIsOpenCallback?: (open: boolean) => void;
}> = ({ header = '', children, disclosureIsOpen = false, setDisclosureIsOpenCallback }) => {
  const [isOpen, setIsOpen] = useState(disclosureIsOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsOpen(disclosureIsOpen);
  }, [disclosureIsOpen]);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (typeof window === 'undefined') {
    return <></>;
  }

  return (
    <>
      {/* <Disclosure as="div" className={`bg-white shadow-md my-lg py-lg rounded-lg`} defaultOpen={isOpen}>
        {() => {
          return (
            <>
              <div className="px-md md:px-lg">
                <DisclosureButton
                  onClick={() => {
                    setIsOpen(!isOpen);
                    setDisclosureIsOpenCallback && setDisclosureIsOpenCallback(!isOpen);
                  }}
                  onKeyDown={(e) => {
                    if (e.key == ' ' || e.key == 'Enter') {
                      setIsOpen(!isOpen);
                      setDisclosureIsOpenCallback && setDisclosureIsOpenCallback(!isOpen);
                    }
                  }}
                  className={cx(
                    `w-full flex justify-between ${isOpen ? `border-b border-gray-stroke pb-sm mb-md` : ``}`
                  )}
                >
                  <div className="flex items-center">
                    <h2 className="text-lg md:text-xl inline-block">{header}</h2>
                  </div>
                  <div>
                    <ChevronRightIcon
                      fontSize="large"
                      className={cx(`${isOpen ? 'transform -rotate-90' : 'transform rotate-90'}`)}
                    />
                  </div>
                </DisclosureButton>
              </div>
              {isOpen && <DisclosurePanel static>{children}</DisclosurePanel>}
            </>
          );
        }}
      </Disclosure> */}
      <div className="">
        <h2 className="text-h3-lg">{header}</h2>
        <div className="mt-24 mb-[6.4rem]">{children}</div>
      </div>
    </>
  );
};
