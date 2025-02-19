'use client';

import React, { useEffect, Fragment, useState } from 'react';
import { init } from '@socialgouv/matomo-next';

import { useLocalStorageValue } from '@react-hookz/web';

export function MatomoWrapper({ children }) {
  const localstorageKey = 'matomoIsActive';
  const { value: matomo } = useLocalStorageValue(localstorageKey, {
    defaultValue: false,
    initializeWithValue: true,
  });
  const [haveInit, setHaveInit] = useState(false);

  const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
  const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

  useEffect(() => {
    if (matomo && !haveInit) {
      init({ url: `${MATOMO_URL}`, siteId: `${MATOMO_SITE_ID}` });
      setHaveInit(true);
    }

    // If deactivate reload site (there is no de-init)
    if (haveInit && !matomo) {
      location.reload();
    }
  }, [MATOMO_SITE_ID, MATOMO_URL, haveInit, matomo]);

  return <Fragment>{children}</Fragment>;
}
