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

export default function MyAppLayout({ children }) {
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
