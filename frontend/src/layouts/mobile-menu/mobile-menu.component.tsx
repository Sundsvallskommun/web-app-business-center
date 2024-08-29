'use client';

import { Button, Divider, Icon, MenuVertical, Modal, cx } from '@sk-web-gui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/app.context';
import { RepresentingMode } from '../../interfaces/app';
import { getSwitchedRepresentingMode } from '../../utils/representingModeRoute';
import { useBannerMenuItems } from '../banner-menu/banner-menu-items';
import { MyPagesBusinessSwitch } from '../site-menu/site-menu-items';

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const bannerMenuItems = useBannerMenuItems();
  const pathname = usePathname();
  const router = useRouter();
  const { representingMode, setRepresentingMode } = useAppContext();

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
      <Button iconButton variant="tertiary" showBackground={false} size="lg" onClick={openHandler}>
        <Icon name="menu" />
      </Button>

      <Modal
        show={isOpen}
        className="fixed rounded-0 pt-30 right-0 top-0 w-[calc(100%_-_4.4rem)] h-dvh"
        onClose={closeHandler}
        closeButtonProps={{ size: 'lg', className: cx('-mr-md') }}
        label={<h1 className="text-h4-md mb-0">Meny</h1>}
        contentTransitionProps={{
          enter: 'transform transition ease-out duration-200',
          enterFrom: 'translate-x-full',
          enterTo: 'translate-x-0',
          leave: 'transform transition ease-in duration-100',
          leaveFrom: 'translate-x-0',
          leaveTo: 'translate-x-full',
        }}
      >
        <Modal.Content className="grow overflow-y-scroll gap-24">
          <MenuVertical.Provider>
            <MenuVertical.Nav>
              <MenuVertical>
                {bannerMenuItems.map((item, index) => (
                  <MenuVertical.Item
                    className="font-bold"
                    key={`${index}`}
                    current={pathname?.includes(item.props.href)}
                  >
                    {item}
                  </MenuVertical.Item>
                ))}
              </MenuVertical>
            </MenuVertical.Nav>
          </MenuVertical.Provider>
          <Divider className="m-0 grow-0" />
          <Button
            className="w-full"
            onClick={() => {
              setRepresentingMode(getSwitchedRepresentingMode(representingMode));
              setIsOpen(false);
            }}
            showBackground={false}
            variant="tertiary"
            rightIcon={<Icon name="arrow-right" />}
          >
            Till Mina sidor {representingMode === RepresentingMode.BUSINESS ? 'privat' : 'företag'}
          </Button>
          <MyPagesBusinessSwitch submitCallback={() => setIsOpen(false)} />
        </Modal.Content>
        <Modal.Footer>
          <Button
            className="w-full"
            onClick={() => router.push('/logout')}
            showBackground={false}
            variant="secondary"
            leftIcon={<Icon name="log-out" />}
          >
            Logga ut
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
