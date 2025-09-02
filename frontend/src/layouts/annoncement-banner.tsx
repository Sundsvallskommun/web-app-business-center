'use client';

import { ExternalLink } from 'lucide-react';
import NextLink from 'next/link';

//URL to the old minasidor website
const URL_OLD = 'https://minasidor.stadsbacken.se/';

export function AnnouncementBanner() {
  return (
    <div
      className="w-full bg-background-200 flex items-center justify-center py-10 px-[5rem] min-h-[6rem]"
      role="region"
      aria-label="Informationsmeddelande"
    >
      <p className="text-base">
        Mina sidor är under uppbyggnad och utvecklas med att visa flera ärenden och funktioner. Saknar du något kan du
        fortfarande använda den äldre versionen av{' '}
        <NextLink href={URL_OLD} className="underline inline-flex items-center gap-1 text-vattjom-surface-primary">
          Mina sidor
          <ExternalLink size={14} aria-hidden className="inline-block shrink-0" />
        </NextLink>
      </p>
    </div>
  );
}
