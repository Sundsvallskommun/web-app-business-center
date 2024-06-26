'use client';

import { Button, Divider, Icon, MenuVertical, Modal, cx } from '@sk-web-gui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/app.context';
import { MyPagesMode } from '../../interfaces/app';
import { appURL } from '../../utils/app-url';
import { newMyPagesModePathname } from '../../utils/pagesModeRoute';
import { useBannerMenuItems } from '../banner-menu/banner-menu-items';
import { useRepresentingSwitch } from '../site-menu/site-menu-items';
import { useApi } from '../../services/api-service';
import { BusinessEngagementData } from '../../services/organisation-service';
import { BusinessEngagement } from '../../interfaces/organisation-info';

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const bannerMenuItems = useBannerMenuItems();
  const pathname = usePathname();
  const { isMyPagesModeBusiness } = useAppContext();
  const router = useRouter();
  const { setRepresenting } = useRepresentingSwitch();

  const { data: businessEngagements } = useApi<BusinessEngagementData, Error, BusinessEngagement[]>({
    url: '/businessengagements',
    method: 'get',
    dataHandler: (data?: BusinessEngagementData) => data?.engagements ?? [],
  });

  const openHandler = () => {
    setIsOpen(true);
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  const switchMyPagesMode = () => {
    const pathname = newMyPagesModePathname(isMyPagesModeBusiness ? MyPagesMode.PRIVATE : MyPagesMode.BUSINESS);
    router.push(`${appURL()}${pathname}`);
  };

  const setEngagement = (value) => {
    setRepresenting(value);
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
        className="absolute rounded-0 pt-30 right-0 top-0 w-[calc(100%_-_4.4rem)] h-dvh"
        onClose={closeHandler}
        closeButtonProps={{ size: 'lg', className: cx('-mr-md') }}
        label={<h1 className="text-h4-md mb-0">Meny</h1>}
      >
        <Modal.Content className="grow overflow-y-scroll">
          <MenuVertical.Provider>
            <MenuVertical.Nav className="grow">
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
                    {businessEngagements?.map((engagement, index) => (
                      <MenuVertical.Item key={`${index}`}>
                        <button onClick={() => setEngagement(engagement.organizationNumber)}>
                          <span className="text-left">{engagement.organizationName}</span>
                        </button>
                      </MenuVertical.Item>
                    ))}
                  </MenuVertical>
                </MenuVertical.Item>
                <MenuVertical.Item>
                  <button onClick={switchMyPagesMode}>
                    <span className="flex justify-between">
                      <span className="grow text-left font-bold">{`Till Mina sidor ${isMyPagesModeBusiness ? 'privat' : 'företag'}`}</span>
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
