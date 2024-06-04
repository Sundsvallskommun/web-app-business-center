import { Popover, PopoverButton } from '@headlessui/react';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { useEffect, useRef } from 'react';
import { useAppContext } from '@contexts/app.context';
import { getNotifications } from '@services/notifications-service';
import NotificationsModal from '../notifications-modal/notifications-modal.component';

export const NotificationsAlert: React.FC = () => {
  const popoverButtonRef = useRef<HTMLButtonElement>(null);
  const { notificationAlerts, setNotificationAlerts, cases, user } = useAppContext();

  const closeModal = () => {
    popoverButtonRef?.current?.click();
  };

  useEffect(() => {
    if (cases.cases?.length > 0) {
      getNotifications(user, cases).then((res) => {
        setNotificationAlerts(res);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, user]);

  return (
    <Popover className="lg:relative">
      <div className="lg:relative mr-sm sm:mr-md">
        <PopoverButton
          ref={popoverButtonRef}
          aria-label={`Det finns ${notificationAlerts.length > 0 ? notificationAlerts.length : 'inga'} nya händelser`}
        >
          <div className="relative cursor-pointer text-xl lg:text-2xl">
            <NotificationsActiveOutlinedIcon className="material-icon" />
            {notificationAlerts && notificationAlerts.length > 0 ? (
              <div className="absolute text-white text-xs font-bold flex items-center justify-center w-[24px] h-[24px] bg-red rounded-full -top-2 -right-5 border-2 border-white box-content">
                <span className="ml-[1px]">{notificationAlerts.length > 99 ? '99+' : notificationAlerts.length}</span>
              </div>
            ) : (
              ''
            )}
          </div>
        </PopoverButton>
      </div>

      <Popover.Panel className="absolute z-10 right-0 left-0 lg:left-auto">
        <NotificationsModal isOpen={true} closeModal={closeModal} notificationAlerts={notificationAlerts} />
      </Popover.Panel>
    </Popover>
  );
};
