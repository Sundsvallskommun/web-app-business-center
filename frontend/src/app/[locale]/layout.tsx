import initLocalization from '../i18n';
import LocalizationProvider from '@components/localization-provider/localization-provider';
import { appName } from '@utils/app-name';
import { headers } from 'next/headers';
import { ReactNode } from 'react';

const namespaces = [
  'about',
  'accessibility',
  'bankid',
  'cases',
  'common',
  'confirmation',
  'cookies',
  'decisions',
  'invoice',
  'layout',
  'login',
  'notifications',
  'overview',
  'paths',
  'profile',
  'valj-foretag',
];

export interface LocalizationLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

const LocalizationLayout = async (props: LocalizationLayoutProps) => {
  const { params, children } = props;
  const { locale } = await params;
  const { resources } = await initLocalization(locale, namespaces);

  return <LocalizationProvider {...{ locale, resources, namespaces }}>{children}</LocalizationProvider>;
};

export const generateMetadata = async ({ params }: LocalizationLayoutProps) => {
  const { locale } = await params;
  const { t } = await initLocalization(locale ?? 'sv', namespaces);
  const path = (await headers()).get('x-path');

  const pathparts = path
    ?.replace(/^\/?/, '')
    .split('/')
    .reverse();

  const pathname = pathparts
    ?.map((part) => t(`paths:${part}.title`, { defaultValue: '' }))
    .filter((part) => !!part)
    .join(' - ');

  const getTitle = () => {
    if (path && pathname) {
      return `${pathname} - ${appName()}`;
    }
    return appName();
  };

  const description = pathparts?.[0] ? t(`paths:${pathparts?.[0]}.description`, { defaultValue: '' }) : '';

  return {
    title: getTitle(),
    description,
  };
};

export default LocalizationLayout;
