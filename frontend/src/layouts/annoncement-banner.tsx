'use client';

import { Link } from '@sk-web-gui/react';

//URL to the old minasidor website
const URL_OLD = 'https://e-tjanster.sundsvall.se/minasidor';

export function AnnouncementBanner() {
  return (
    <div
      className="w-full bg-background-200 flex items-center justify-center py-10 min-h-[6rem] sk-header"
      role="region"
      aria-label="Informationsmeddelande"
    >
      <div className="max-w-[128rem] justify-center flex-grow">
        <p className="text-base">
          Du är nu inloggad i nya Mina sidor. Saknar du något kan du fortfarande använda den{' '}
          <Link external href={URL_OLD}>
            äldre versionen av Mina sidor
          </Link>
        </p>
      </div>
    </div>
  );
}
