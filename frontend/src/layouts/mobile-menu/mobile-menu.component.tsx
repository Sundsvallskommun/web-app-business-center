'use client';

import { Button, Divider, Icon, Link, MenuVertical, Modal, cx } from '@sk-web-gui/react';
import { ArrowRight, LogOut, Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/app.context';
import { RepresentingMode } from '../../interfaces/app';
import { getSwitchedRepresentingMode, newRepresentingModePathname } from '../../utils/representingModeRoute';
import { useBannerMenuItems } from '../banner-menu/banner-menu-items';
import { MyPagesBusinessSwitch } from '../site-menu/site-menu-items';

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const bannerMenuItems = useBannerMenuItems();
  const pathname = usePathname();
  const router = useRouter();
  const { representingMode } = useAppContext();
  const { t } = useTranslation('common');

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
      <Button aria-label={t('common:menu')} iconButton size="lg" onClick={openHandler}>
        <Icon icon={<Menu />} />
      </Button>

      <Modal
        show={isOpen}
        className="fixed rounded-0 pt-30 right-0 top-0 w-[calc(100%_-_4.4rem)] h-dvh"
        onClose={closeHandler}
        closeButtonProps={{ size: 'lg', className: cx('-mr-md') }}
        label={<h1 className="text-h4-md mb-0">{t('common:menu')}</h1>}
        closeLabel={t('common:closeMenu')}
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
            <MenuVertical.Nav aria-label={t('common:subpages')}>
              <MenuVertical aria-label={t('common:subpages')}>
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
          {representingMode === RepresentingMode.BUSINESS ? (
            <MyPagesBusinessSwitch submitCallback={() => setIsOpen(false)} />
          ) : null}
          <Button
            className="w-full"
            onClick={() => {
              router.push(newRepresentingModePathname(getSwitchedRepresentingMode(representingMode), pathname));
              setIsOpen(false);
            }}
            showBackground={false}
            variant="tertiary"
            rightIcon={<Icon icon={<ArrowRight />} />}
          >
            {representingMode === RepresentingMode.BUSINESS ? t('common:toMyPagesPrivate') : t('common:toMyPagesBusiness')}
          </Button>
          <Button className="w-full" showBackground={false}
            variant="tertiary">
              <Link
                href={'https://e-tjanster.sundsvall.se/'}
                variant="tertiary"
                external={true}
                strong={true}
              >
                {t('common:eServices')}
              </Link>
            </Button>
        </Modal.Content>
        <Modal.Footer>
          <Button
            className="w-full"
            onClick={() => router.push('/logout')}
            showBackground={false}
            variant="secondary"
            leftIcon={<Icon icon={<LogOut />} />}
          >
            {t('common:logout.logout')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
