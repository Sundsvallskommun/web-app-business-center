'use client';

import { AppWrapper } from '@contexts/app.context';
import { ConfirmationDialogContextProvider, GuiProvider, defaultTheme } from '@sk-web-gui/react';
import { MatomoWrapper } from '@utils/matomo-wrapper';
import dayjs from 'dayjs';
import 'dayjs/locale/se';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import '../../../tailwind.scss';
import i18nConfig from '../../app/i18nConfig';
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

const theme = { ...defaultTheme, screens: { ...defaultTheme.screens, 'desktop-min': '1024px' } };

export default function MyAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={i18nConfig.defaultLocale}>
      <body>
        <GuiProvider theme={theme}>
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
