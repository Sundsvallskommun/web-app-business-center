'use client';

import { Button, Divider, Icon, MenuVertical, Modal, cx } from '@sk-web-gui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/app.context';
import { RepresentingEntity, RepresentingMode } from '../../interfaces/app';
import { appURL } from '../../utils/app-url';
import { newRepresentingModePathname } from '../../utils/representingModeRoute';
import { useBannerMenuItems } from '../banner-menu/banner-menu-items';
import { useRepresentingSwitch } from '../site-menu/site-menu-items';
import { useApi } from '../../services/api-service';
import { BusinessEngagementData } from '../../services/organisation-service';
import { BusinessEngagement } from '../../interfaces/organisation-info';

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const bannerMenuItems = useBannerMenuItems();
  const pathname = usePathname();
  const { isRepresentingModeBusiness } = useAppContext();
  const router = useRouter();
  const { setRepresenting } = useRepresentingSwitch();

  const { data: businessEngagements } = useApi<BusinessEngagementData, Error, BusinessEngagement[]>({
    url: '/businessengagements',
    method: 'get',
    dataHandler: (data?: BusinessEngagementData) => data?.engagements ?? [],
  });

  const { data: representingEntity } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });

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

  const setEngagement = (value) => {
    setRepresenting({ organizationNumber: value });
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
                    current={window?.location.href.includes(item.props.href)}
                  >
                    {item}
                  </MenuVertical.Item>
                ))}
              </MenuVertical>
            </MenuVertical.Nav>
          </MenuVertical.Provider>
          <Divider className="m-0 grow-0" />
          <MenuVertical.Provider
            current={isRepresentingModeBusiness ? representingEntity?.BUSINESS?.organizationNumber : undefined}
          >
            <MenuVertical.Nav className="grow">
              <MenuVertical>
                {isRepresentingModeBusiness && (
                  <MenuVertical.Item>
                    <MenuVertical>
                      <MenuVertical.SubmenuButton size="medium">
                        <a href="#">Byt organisation</a>
                      </MenuVertical.SubmenuButton>
                      {businessEngagements?.map((engagement, index) => (
                        <MenuVertical.Item key={`${index}`} menuIndex={`${engagement.organizationNumber}`}>
                          <button onClick={() => setEngagement(engagement.organizationNumber)}>
                            <span className="text-left">{engagement.organizationName}</span>
                          </button>
                        </MenuVertical.Item>
                      ))}
                    </MenuVertical>
                  </MenuVertical.Item>
                )}

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
        </Modal.Content>
      </Modal>
    </div>
  );
};
