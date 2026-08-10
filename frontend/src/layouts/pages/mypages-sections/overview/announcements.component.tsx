'use client';

import { Announcement } from '@interfaces/announcements';
import { RepresentingEntity, RepresentingMode } from '@interfaces/app';
import { useApi } from '@services/api-service';
import { Image, Link, Spinner } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

const announcementsSource: Announcement[] = [
  {
    id: 0,
    title: 'Välkommen till nya Mina sidor',
    text: 'Nu blir det enklare för dig som bor och verkar i Sundsvall att se och följa ärenden du har med kommunen. Med våra nya Mina sidor får du en mer samlad bild över dina ärenden. Mer funktionalitet och förbättringar kommer lanseras löpande.',
    urlTitle: 'Läs mer om nya Mina sidor',
    url: 'https://sundsvall.se/omminasidor',
    image: '/placeholder_3.png',
    imageAlt: 'Läs mer om nya Mina sidor',
    modes: [RepresentingMode.PRIVATE, RepresentingMode.BUSINESS],
  },
];

type AnnouncementsProps = {
  modeOverride?: RepresentingMode;
};

export const Announcements = ({ modeOverride }: AnnouncementsProps) => {
  const { t } = useTranslation('overview');

  const { data: representingEntity, isLoading } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });

  const mode = modeOverride ?? representingEntity?.mode ?? RepresentingMode.PRIVATE;

  const items = announcementsSource.filter((a) => a.modes?.includes(mode));

  if (isLoading && !modeOverride) {
    return <Spinner />;
  }

  if (items.length === 0) {
    return <></>;
  }

  return (
    <section className="pt-80">
      <h3>{t('overview:announcements.title')}</h3>
      <div className="flex flex-col gap-24 my-24">
        {items.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-background-content shadow-50 rounded-cards max-w-[106rem] min-h-[20rem] flex flex-col sm:flex-row sm:min-w-[36rem]"
          >
            <Image
              src={announcement.image}
              alt={announcement.imageAlt}
              className="rounded-t-cards sm:rounded-r-0 sm:rounded-l-cards object-cover grow w-full md:max-h-[60vw] sm:w-[32rem] sm:max-w-[35vw]"
            />
            <div className="p-24 flex flex-col gap-16">
              <h2 className="text-h3-md">{t('overview:welcome.title')}</h2>
              <p>{t('overview:welcome.description')}</p>
              {announcement.url && (
                <Link external className="font-bold text-dark underline" href={announcement.url}>
                  {t('overview:welcome.readMore')}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
