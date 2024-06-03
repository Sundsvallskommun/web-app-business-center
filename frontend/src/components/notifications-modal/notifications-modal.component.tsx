import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { getNotifications, clearNotifications } from '@services/notifications-service';
import { getMe } from '@services/user-service';
import { Button, Link } from '@sk-web-gui/react';
import { useState } from 'react';
import { useAppContext } from '../../contexts/app.context';
import { ICase } from '../../interfaces/case';
import { statusCodes } from '../../interfaces/status-codes';
import NotificationComponent from '../notification-component/notification.component';

const NotificationsModal: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
  notificationAlerts: ICase[];
}> = ({ isOpen = false, closeModal, notificationAlerts = [] }) => {
  const { setUser, setNotificationAlerts, cases } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleClearNotifications: () => void = () => {
    // clear notifications and refresh user
    setIsLoading(true);
    clearNotifications();
    getMe().then((user) => {
      setUser(user);
      getNotifications(user, cases).then((res) => {
        setNotificationAlerts(res);
        setIsLoading(false);
      });
    });
    closeModal();
  };

  const content = (
    <div className="bg-gray-100 lg:bg-white rounded-md lg:border border-gray-400 shadow-lg p-md pb-xl lg:pb-md flex flex-col">
      <div className="flex justify-between mt-sm">
        <h4 className="text-lg">Notifikationer</h4>
        <Link className="lg:hidden" onClick={handleClearNotifications}>
          Rensa alla
        </Link>
      </div>
      {notificationAlerts.length === 0 && <p>Det finns inga notifikationer</p>}
      {notificationAlerts.map((e, idx) => {
        const alertType =
          e.status.code === statusCodes.Approved
            ? 'success'
            : e.status.code === statusCodes.Rejected
            ? 'error'
            : e.status.code === statusCodes.Ongoing
            ? 'info'
            : 'warning';
        return (
          <NotificationComponent clickHandler={closeModal} item={e} type={alertType} key={`notification-${idx}`} />
        );
      })}
      <div className="w-full flex justify-between mt-md">
        <Button
          className="hidden lg:flex"
          type="submit"
          variant="solid"
          size="lg"
          color="primary"
          leftIcon={<DeleteOutlineIcon fontSize="large" className="mr-sm" />}
          onClick={handleClearNotifications}
          loading={isLoading}
          loadingText={'Sparar'}
          disabled={notificationAlerts.length === 0}
        >
          Rensa alla
        </Button>
      </div>
    </div>
  );

  return (
    isOpen && (
      <>
        <div className="block lg:hidden w-screen absolute top-9 min-h-80 z-10">{content}</div>
        <div className="hidden lg:block absolute top-10 -right-14 min-w-[50rem] w-min min-h-80">{content}</div>
      </>
    )
  );
};

export default NotificationsModal;
