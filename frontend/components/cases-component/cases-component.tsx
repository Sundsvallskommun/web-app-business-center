import { Disclosure } from '@headlessui/react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { cx } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import styles from './cases-component.module.scss';

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
      <Disclosure
        as="div"
        className={`${styles.caseswrapper} bg-white shadow-md my-lg py-lg rounded-lg`}
        defaultOpen={isOpen}
      >
        {() => {
          return (
            <>
              <div className="px-md md:px-lg">
                <Disclosure.Button
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
                </Disclosure.Button>
              </div>
              {isOpen && <Disclosure.Panel static>{children}</Disclosure.Panel>}
            </>
          );
        }}
      </Disclosure>
      {/*<div className="mb-xl block lg:hidden">
        <header className="mx-md md:mx-lg mb-md">
          <div className="flex justify-between">
            <h2 className="text-lg">{header}</h2>
            <span className="text-gray flex justify-between items-center">
              <HelpTooltip ariaLabel={'Hjälptext'}>{helpText}</HelpTooltip>
            </span>
          </div>
        </header>
        {children}
      </div>*/}
    </>
  );
};
