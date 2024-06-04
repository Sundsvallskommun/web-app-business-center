import AlertBannerWrapper from '@components/alert-banner/alert-banner-wrapper.component';
import Head from 'next/head';

export default function EmptyLayout({ title, children }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Mina Sidor Företag" />
        <meta name="theme-color" content="#00538a"></meta>
        <meta name="msapplication-navbutton-color" content="#00538a"></meta>
        <meta name="apple-mobile-web-app-status-bar-style" content="#00538a"></meta>
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"></meta>
      </Head>

      <AlertBannerWrapper />

      <div className="bg-background-100 min-h-screen">{children}</div>
    </>
  );
}
