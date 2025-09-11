'use client';

import { Link } from '@sk-web-gui/react';

//URL to the old minasidor website
const URL_OLD = 'https://e-tjanster.sundsvall.se/minasidor';

export function AnnouncementBanner() {
  return (
    <div
      className="w-full bg-background-200 flex items-center justify-center py-10 px-[5rem] min-h-[6rem]"
      role="region"
      aria-label="Informationsmeddelande"
    >
      <p className="text-base">
        Du är nu inloggad i nya Mina sidor. Saknar du något? Du kan byta till den äldre versionen av Mina sidor här.{' '}
        <Link external href={URL_OLD}>Mina sidor</Link>
      </p>
    </div>
  );
}
