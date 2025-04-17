import { useAppContext } from '@contexts/app.context';
import { Asset } from '@data-contracts/partyassets/data-contracts';
import { useApi } from '@services/api-service';
import { Button, Icon } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import dayjs from 'dayjs';
import { ChevronRight, FileCheck2 } from 'lucide-react';
import NextLink from 'next/link';

export const Assets = () => {
  const { representingMode } = useAppContext();

  const { data: assetsData } = useApi<Asset[]>({
    url: '/assets',
    method: 'get',
  });

  return (
    <section>
      <h2>Beslut</h2>
      <ul aria-label="Beslut" className="mt-24 flex flex-col gap-y-16">
        {assetsData?.map((asset, i) => (
          <li key={i}>
            <NextLink href={`${getRepresentingModeRoute(representingMode)}/beslut-och-dokument/${asset.id}`}>
              <div className={`list-item-card`}>
                <div className="list-item-card-content">
                  <div className="list-item-card-content-icon">
                    <Icon icon={<FileCheck2 />} />
                  </div>
                  <div>
                    <div className="list-item-card-content-title">{asset.description}</div>
                    <div className="list-item-card-content-subtitle">{dayjs(asset.issued).format('D MMM YYYY')}</div>
                  </div>
                </div>
                <div className="list-item-card-button">
                  <Button as="span" variant="tertiary" showBackground={false} iconButton aria-label="Gå till beslut">
                    <Icon icon={<ChevronRight />} />
                  </Button>
                </div>
              </div>
            </NextLink>
          </li>
        ))}
      </ul>
    </section>
  );
};
