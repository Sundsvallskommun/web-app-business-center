import { cx } from '@sk-web-gui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

export const TabMenu: React.FC<{ className?; activeUrl? }> = ({ className, activeUrl = '' }) => {
  const initialFocus = useRef(null);
  const [_activeUrl, setActiveUrl] = useState(activeUrl);

  const router = useRouter();

  const links = [
    {
      label: 'Översikt',
      url: '/oversikt',
    },
    {
      label: 'Företagsuppgifter',
      url: '/foretagsuppgifter',
    },
    {
      label: 'Kontaktuppgifter',
      url: '/kontaktuppgifter',
    },
    {
      label: 'Fakturor',
      url: '/fakturor',
    },
  ];

  const setInitialFocus = () => {
    if (initialFocus.current) {
      setTimeout(() => {
        if (initialFocus.current) {
          initialFocus.current.focus();
        }
      }, 10);
    }
  };

  useEffect(() => {
    if (initialFocus) {
      setInitialFocus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFocus?.current]);

  useEffect(() => {
    setActiveUrl(router.pathname);
  }, [router.pathname]);

  return (
    <div className={cx(className, 'mt-lg')}>
      <div className="hidden lg:block pb-2" style={{ boxShadow: '0px -2px 0px #ECECEC inset' }}>
        {links.map((link, index) => {
          if (link.url == _activeUrl) {
            return (
              <Link legacyBehavior href={link.url} key={`${index}-${link.url}-label`}>
                <a ref={initialFocus} className="text-base font-bold border-b-2 border-primary pb-2 mr-12">
                  {link.label}
                </a>
              </Link>
            );
          } else {
            return (
              <Link legacyBehavior href={link.url} key={`${index}-${link.url}-label`}>
                <a className="text-base text-gray font-bold border-b-2 border-transparent mr-12">{link.label}</a>
              </Link>
            );
          }
        })}
      </div>
    </div>
  );
};

export default TabMenu;
