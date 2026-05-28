'use client';

import { MetaCard } from '@sk-web-gui/card';
import { MonitorSmartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ExternalService = {
  id: number;
  label: string;
  url: string;
  description?: string;
};

const servicesSource: ExternalService[] = [
  { id: 1, label: 'Vuxenutbildning', url: 'https://sundsvall.alvis.se/Login?ReturnUrl=%2Fminasidor' },
  { id: 2, label: 'Stadsbibliotek', url: 'https://bibliotek.sundsvall.se/' },
  { id: 3, label: 'Boka idrottshall och elcykel', url: 'https://sundsvall.actorsmartbook.se' },
  { id: 4, label: 'Vklass', url: 'https://auth.vklass.se/' },
  { id: 5, label: 'Förskola/Fritidshem', url: 'https://e-tjanster.sundsvall.se/oversikt/overview/74' },
  { id: 6, label: 'Kulturskolan', url: 'https://www.studyalong.se/sundsvall' },
];

type ExternalMinaSidorProps = {
  services?: ExternalService[];
};

const ExternalMinaSidor = ({ services }: ExternalMinaSidorProps) => {
  const { t } = useTranslation('overview');
  const items = services?.length ? services : servicesSource;
  if (!items.length) return null;

  return (
    <section className="pt-80">
      <h3>{t('overview:externalServices.title')}</h3>

      <p className="mt-12 max-w-[106rem]">{t('overview:externalServices.description')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-24 my-24 max-w-[106rem]">
        {items.map((svc) => (
          <MetaCard
            key={svc.id}
            href={svc.url}
            useHoverEffect
            icon={<MonitorSmartphone />}
            color="mono"
            aria-label={t('overview:externalServices.openExternal', { label: svc.label })}
            onClick={(e) => {
              e.preventDefault();
              window.open(svc.url, '_blank', 'noopener,noreferrer');
            }}
          >
            <MetaCard.Header>
              <h4 className="text-h4-md">{svc.label}</h4>
            </MetaCard.Header>

            {svc.description && (
              <MetaCard.Text>
                <p className="mt-8">{svc.description}</p>
              </MetaCard.Text>
            )}
          </MetaCard>
        ))}
      </div>
    </section>
  );
};

export default ExternalMinaSidor;
