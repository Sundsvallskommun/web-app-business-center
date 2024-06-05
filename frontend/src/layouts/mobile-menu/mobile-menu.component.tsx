'use client';

import { Button, Icon, MenuVertical, Modal, cx } from '@sk-web-gui/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBannerMenuItems } from '../banner-menu/banner-menu-items';
import { MyPagesBusinessSwitch, MyPagesToggle, useSiteMenuItems } from '../site-menu/site-menu-items';
import { useAppContext } from '../../contexts/app.context';

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const bannerMenuItems = useBannerMenuItems();
  const siteMenuItems = useSiteMenuItems();
  const pathname = usePathname();
  const { isMyPagesModeBusiness } = useAppContext();

  const openHandler = () => {
    setIsOpen(true);
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    closeHandler();
  }, [pathname]);

  return (
    <div>
      <Button iconButton size="lg" onClick={openHandler}>
        <Icon name="menu" />
      </Button>

      <Modal
        show={isOpen}
        className="absolute rounded-0 pt-30 right-0 top-0 w-[calc(100%_-_4.4rem)] h-dvh"
        onClose={closeHandler}
        closeButtonProps={{ size: 'lg', className: cx('-mr-md') }}
      >
        <Modal.Content>
          <div className="absolute left-0 top-0 mt-26 ml-24">
            <MyPagesToggle />
          </div>

          {isMyPagesModeBusiness && (
            <div className="mt-sm mb-lg">
              <MyPagesBusinessSwitch closeCallback={closeHandler} />
            </div>
          )}

          <div>
            <MenuVertical.Provider>
              <MenuVertical.Nav>
                <MenuVertical>
                  {bannerMenuItems.map((item, index) => (
                    <MenuVertical.Item key={`${index}`} current={window?.location.href.includes(item.props.href)}>
                      {item}
                    </MenuVertical.Item>
                  ))}
                </MenuVertical>
              </MenuVertical.Nav>
            </MenuVertical.Provider>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className="mt-md">
            <ul className="flex flex-col gap-y-6">
              {siteMenuItems.map((item, index) => (
                <li key={`${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
