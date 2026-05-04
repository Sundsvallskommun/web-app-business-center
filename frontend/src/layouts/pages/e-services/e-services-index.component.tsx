import { E_SERVICES } from '@interfaces/e-service';
import { Button, Icon } from '@sk-web-gui/react';
import { ChevronRight } from 'lucide-react';
import NextLink from 'next/link';

export const EServicesIndex: React.FC = () => {
  return (
    <div className="flex flex-col gap-32" data-cy="e-services-index">
      <header className="text-content">
        <h1>Ansök</h1>
        <p>Här kan du starta en ny ansökan hos Sundsvalls kommun.</p>
      </header>

      <ul className="flex flex-col gap-16" aria-label="Tillgängliga ansökningar">
        {E_SERVICES.map((service) => (
          <li key={service.key}>
            <NextLink
              href={service.href}
              className="list-item-card-link"
              data-cy={`e-service-card-${service.key}`}
              aria-label={`Starta ansökan: ${service.title}`}
            >
              <div className="list-item-card">
                <div className="list-item-card-content">
                  <div>
                    <div className="list-item-card-content-title">{service.title}</div>
                    <div className="list-item-card-content-subtitle">{service.description}</div>
                  </div>
                </div>
                <div className="list-item-card-button">
                  <Button
                    as="span"
                    size="lg"
                    variant="tertiary"
                    showBackground={false}
                    iconButton
                    aria-label="Starta ansökan"
                  >
                    <Icon icon={<ChevronRight />} />
                  </Button>
                </div>
              </div>
            </NextLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EServicesIndex;
