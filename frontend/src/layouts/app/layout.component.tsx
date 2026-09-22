'use client';

import { AppWrapper } from '@contexts/app.context';
import { ConfirmationDialogContextProvider, GuiProvider, defaultTheme } from '@sk-web-gui/react';
import { MatomoWrapper } from '@utils/matomo-wrapper';
import dayjs from 'dayjs';
import 'dayjs/locale/sv';
import utc from 'dayjs/plugin/utc';
import '../../../tailwind.scss';
import i18nConfig from '../../app/i18nConfig';
import { LoginGuard } from './login-guard';

dayjs.extend(utc);
dayjs.locale('sv');

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
