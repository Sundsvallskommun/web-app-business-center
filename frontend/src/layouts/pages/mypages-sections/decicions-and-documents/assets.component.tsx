import { CardList } from '@components/cards/cards.component';
import { useAppContext } from '@contexts/app.context';
import { Asset } from '@data-contracts/partyassets/data-contracts';
import { useApi } from '@services/api-service';
import { filterAllowedAssets } from '@services/asset-service';
import { Button, Icon, Spinner } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import dayjs from 'dayjs';
import sv from 'dayjs/locale/sv';
import { ChevronRight, FileCheck2 } from 'lucide-react';
import NextLink from 'next/link';

dayjs.locale(sv);

const AssetCard: React.FC<{ item: Asset }> = ({ item }) => {
  const { representingMode } = useAppContext();

  return (
    <NextLink
      href={`${getRepresentingModeRoute(representingMode)}/beslut-och-dokument/${item.assetId}`}
      aria-label={`Visa ${item.assetId}`}
      className={`list-item-card-link`}
    >
      <div className={`list-item-card`}>
        <div className="list-item-card-content">
          <div className="flex items-center gap-16">
            <div className="list-item-card-content-icon">
              <Icon icon={<FileCheck2 />} />
            </div>
            <div>
              <div className="list-item-card-content-title">{item.description}</div>
              <div className="list-item-card-content-subtitle">{dayjs(item.issued).format('D MMM YYYY')}</div>
            </div>
          </div>
        </div>
        <div className="list-item-card-button">
          <Button as="span" variant="tertiary" showBackground={false} iconButton aria-label="Gå till beslut">
            <Icon icon={<ChevronRight />} />
          </Button>
        </div>
      </div>
    </NextLink>
  );
};

export const Assets = () => {
  const { data: assetsData, isFetching: isFetchingAssets } = useApi<Asset[]>({
    url: '/assets',
    method: 'get',
  });

  const visibleAssets = filterAllowedAssets(assetsData);

  return (
    <section>
      <h2 className="text-h3-sm md:text-h3-md xl:text-h3-lg mb-16">Dokument</h2>
      {!isFetchingAssets && visibleAssets?.length === 0 ? (
        <p>Du har inga beslut eller dokument ännu.</p>
      ) : (
        isFetchingAssets && (
          <div className="flex items-center">
            <p className="text-secondary">Laddar beslut och dokument</p>
            <Spinner className="ml-10" size={2} />
          </div>
        )
      )}
      {visibleAssets && visibleAssets.length > 0 && (
        <CardList
          aria-label="Dokument"
          data={visibleAssets}
          Card={AssetCard}
          amountDisplayed={5}
          showMoreText="Visa fler"
          showLessText="Visa färre"
        />
      )}
    </section>
  );
};
