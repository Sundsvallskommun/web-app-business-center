'use client';

import { Button, Divider, Icon, MenuVertical, Modal, cx } from '@sk-web-gui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/app.context';
import { RepresentingMode } from '../../interfaces/app';
import { appURL } from '../../utils/app-url';
import { newRepresentingModePathname } from '../../utils/representingModeRoute';
import { useBannerMenuItems } from '../banner-menu/banner-menu-items';

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const bannerMenuItems = useBannerMenuItems();
  const pathname = usePathname();
  const { isRepresentingModeBusiness } = useAppContext();
  const router = useRouter();

  const openHandler = () => {
    setIsOpen(true);
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  const switchRepresentingMode = () => {
    const pathname = newRepresentingModePathname(
      isRepresentingModeBusiness ? RepresentingMode.PRIVATE : RepresentingMode.BUSINESS
    );
    router.push(`${appURL()}${pathname}`);
  };

  useEffect(() => {
    closeHandler();
  }, [pathname]);

  return (
    <div>
      <Button iconButton variant="tertiary" showBackground={false} size="lg" onClick={openHandler}>
        <Icon name="menu" />
      </Button>

      <Modal
        show={isOpen}
        className="absolute rounded-0 pt-30 right-0 top-0 w-[calc(100%_-_4.4rem)] h-dvh"
        onClose={closeHandler}
        closeButtonProps={{ size: 'lg', className: cx('-mr-md') }}
        label={<h1 className="text-h4-md mb-0">Meny</h1>}
      >
        <Modal.Content className="grow">
          <MenuVertical.Provider>
            <MenuVertical.Nav>
              <MenuVertical>
                {bannerMenuItems.map((item, index) => (
                  <MenuVertical.Item
                    className="font-bold"
                    key={`${index}`}
                    current={window?.location.href.includes(item.props.href)}
                  >
                    {item}
                  </MenuVertical.Item>
                ))}

                <MenuVertical.Item>
                  <Divider className="my-24" />
                </MenuVertical.Item>
                <MenuVertical.Item>
                  <MenuVertical>
                    <MenuVertical.SubmenuButton size="medium">
                      <a href="#">Byt organisation</a>
                    </MenuVertical.SubmenuButton>
                    <MenuVertical.Item key={`test`}>
                      <a href="#">test</a>
                    </MenuVertical.Item>
                  </MenuVertical>
                </MenuVertical.Item>
                <MenuVertical.Item>
                  <button onClick={switchRepresentingMode}>
                    <span className="flex justify-between">
                      <span className="grow text-left font-bold">{`Till Mina sidor ${isRepresentingModeBusiness ? 'privat' : 'företag'}`}</span>
                      <Icon name="arrow-right" />
                    </span>
                  </button>
                </MenuVertical.Item>
              </MenuVertical>
            </MenuVertical.Nav>
          </MenuVertical.Provider>
        </Modal.Content>
        <Modal.Footer>
          <div className="mt-md w-full">
            <Button
              className="w-full"
              onClick={() => router.push('/logout')}
              showBackground={false}
              variant="secondary"
              leftIcon={<Icon name="log-out" />}
            >
              Logga ut
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
