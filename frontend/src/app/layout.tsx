import 'dayjs/locale/se';
import _ from 'lodash';
import { headers } from 'next/headers';
import { Metadata } from 'next/types';
import '../../tailwind.scss';
import MyAppLayout from '../components/app/layout.component';
import { RepresentingMode } from '../interfaces/app';
import { appName } from '../utils/app-name';
import { getRepresentingModeName } from '../utils/representingModeRoute';

const routeName = () => {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';
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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${appName()}${routeName()}`,
    description: 'Ärenden, fakturor, kontaktinställningar samlat på ett ställe.',
  };
}

export default function Index({ children }) {
  return <MyAppLayout>{children}</MyAppLayout>;
}
