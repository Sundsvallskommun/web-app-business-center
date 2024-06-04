import { cx } from '@sk-web-gui/react';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { ICase } from '../../interfaces/case';
import { useAppContext } from '@contexts/app.context';
import { statusColorMap } from '@utils/status-color';
import { getNotifications, setReadNotification } from '@services/notifications-service';

const NotificationComponent: React.FC<{
  clickHandler: () => void;
  item: ICase;
  type: 'success' | 'info' | 'warning' | 'error';
  className?: string;
}> = ({ clickHandler, item, type, className = '' }) => {
  const router = useRouter();
  const { setHighlightedTableRow, user, cases, setNotificationAlerts } = useAppContext();

  return (
    <button
      tabIndex={0}
      className={cx(
        `${className} mt-md p-sm min-h-28 bg-white border-l-4 align-middle text-left shadow-md ${
          statusColorMap(item.status.color).border
        }`
      )}
      onClick={() => {
        if (clickHandler) {
          clickHandler();
        }
        router
          .push('/oversikt')
          .then(() => setReadNotification({ caseId: item.caseId }))
          .then(() =>
            getNotifications(user, cases).then((res) => {
              setNotificationAlerts(res);
            })
          )
          .then(() => {
            setHighlightedTableRow({
              property: 'caseId',
              value: item.caseId,
            });
          });
      }}
    >
      <div className="flex justify-between">
        <div className="text-lg font-bold whitespace-nowrap mr-md">
          {type === 'success' ? (
            <CheckCircleOutlineOutlinedIcon
              fontSize="large"
              className={cx(`w-10 h-10 mb-2 text-xl text-${statusColorMap(item.status.color)}`)}
            />
          ) : (
            <ErrorIcon
              fontSize="large"
              className={cx(`w-10 h-10 mb-2 text-xl text-${statusColorMap(item.status.color)}`)}
            />
          )}{' '}
          {item.status.label}:{' '}
          <span className="hidden lg:inline">
            {item.subject.caseType} {item.caseId}
          </span>
        </div>
      </div>
      <div className="lg:hidden">
        {item.subject.caseType} {item.caseId}
      </div>
      <div>{`${dayjs(item.lastStatusChange).format('DD MMMM')} klockan ${dayjs(item.lastStatusChange).format(
        'HH:mm'
      )}`}</div>
      <span className="sr-only">Gå till ärende</span>
    </button>
  );
};

export default NotificationComponent;
