'use client';

import { AppWrapper } from '@contexts/app.context';
import { ConfirmationDialogContextProvider, GuiProvider, defaultTheme } from '@sk-web-gui/react';
import { MatomoWrapper } from '@utils/matomo-wrapper';
import dayjs from 'dayjs';
import 'dayjs/locale/se';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import '../../../tailwind.scss';
import { LoginGuard } from './login-guard';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { appName } from '@utils/app-name';
import { getRepresentingModeName } from '@utils/representingModeRoute';
import { RepresentingMode } from '@interfaces/app';
import _ from 'lodash';

dayjs.extend(utc);
dayjs.locale('se');
dayjs.extend(updateLocale);
dayjs.updateLocale('se', {
  months: [
    'Januari',
    'Februari',
    'Mars',
    'April',
    'Maj',
    'Juni',
    'Juli',
    'Augusti',
    'September',
    'Oktober',
    'November',
    'December',
  ],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
  weekdaysMin: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
});

const routeName = (pathname) => {
  return pathname
    .split('/')
    .map((x) => {
      switch (x) {
        case getRepresentingModeName(RepresentingMode.BUSINESS, { urlFriendly: true }):
          x = getRepresentingModeName(RepresentingMode.BUSINESS);
          break;
        case 'arenden':
          x = 'ärenden';
          break;
        case 'oversikt':
          x = 'översikt';
          break;
        default:
        //
      }
      return _.capitalize(x);
    })
    .join(' - ');
};

export default function MyAppLayout({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    document.title = `${appName()}${routeName(pathname)}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return (
    <html lang="se">
      <body>
        <GuiProvider theme={defaultTheme}>
          <ConfirmationDialogContextProvider>
            <AppWrapper>
              <LoginGuard>
                <MatomoWrapper>{children}</MatomoWrapper>
              </LoginGuard>
            </AppWrapper>
          </ConfirmationDialogContextProvider>
        </GuiProvider>
      </body>
    </html>
  );
}
