import type { AppProps /*, AppContext */ } from 'next/app';
import { defaultTheme, GuiProvider, extendTheme } from '@sk-web-gui/react';
import { useMemo, useState } from 'react';
import '../tailwind.scss';
import { AppWrapper } from '../contexts/app.context';
import dayjs from 'dayjs';
import 'dayjs/locale/se';
import utc from 'dayjs/plugin/utc';
import updateLocale from 'dayjs/plugin/updateLocale';
import MatomoWrapper from '@utils/matomo-wrapper';

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
  weekdaysMin: ['S', 'M', 'T', 'O', 'T', 'F', 'L']
});

function MyApp({ Component, pageProps }: AppProps) {
  const [colorScheme] = useState('light');

  const theme = useMemo(
    () =>
      extendTheme({
        cursor: colorScheme === 'light' ? 'pointer' : 'default',
        colorSchemes: defaultTheme.colorSchemes,
      }),
    [colorScheme]
  );

  return (
    <GuiProvider theme={theme} colorScheme={colorScheme}>
      <AppWrapper>
        <MatomoWrapper>
          <Component {...pageProps} />
        </MatomoWrapper>
      </AppWrapper>
    </GuiProvider>
  );
}

export default MyApp;
