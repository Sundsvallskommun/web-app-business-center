import { CardList } from '@components/cards/cards.component';
import { useAppContext } from '@contexts/app.context';
import { AssetWithService } from '@interfaces/asset';
import { useApi } from '@services/api-service';
import { formatAssetValidity, getAssetStatusProps } from '@services/asset-service';
import { Button, Icon, Label, Spinner } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import dayjs from 'dayjs';
import sv from 'dayjs/locale/sv';
import { ChevronRight, FileCheck2 } from 'lucide-react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';

dayjs.locale(sv);

const AssetCard: React.FC<{ item: AssetWithService }> = ({ item }) => {
  const { representingMode } = useAppContext();
  const { t } = useTranslation('decisions');
  const statusProps = getAssetStatusProps(item.status);

  const title = item.service?.restyp?.length ? item.service.restyp.join(', ') : item.description;
  const validity = formatAssetValidity(item, t);

  return (
    <NextLink
      href={`${getRepresentingModeRoute(representingMode)}/beslut-och-dokument/${item.id}`}
      aria-label={`Visa ${title}`}
      className={`list-item-card-link`}
    >
      <div className={`list-item-card`}>
        <div className="list-item-card-content">
          <div className="flex items-center gap-16">
            <div className="list-item-card-content-icon">
              <Icon icon={<FileCheck2 />} />
            </div>
            <div>
              <div className="list-item-card-content-title">{title}</div>
              <div className="list-item-card-content-subtitle">{validity}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-16">
          <Label rounded inverted color={statusProps.color}>
            {t(statusProps.tKey)}
          </Label>
          <div className="list-item-card-button">
            <Button as="span" variant="tertiary" showBackground={false} iconButton aria-label="Gå till beslut">
              <Icon icon={<ChevronRight />} />
            </Button>
          </div>
        </div>
      </div>
    </NextLink>
  );
};

export const Assets = () => {
  const { data: assetsData, isFetching: isFetchingAssets } = useApi<AssetWithService[]>({
    url: '/assets',
    method: 'get',
  });

  return (
    <section>
      <h2 className="text-h3-sm md:text-h3-md xl:text-h3-lg mb-16">Dokument</h2>
      {!isFetchingAssets && assetsData?.length === 0 ? (
        <p>Du har inga beslut eller dokument ännu.</p>
      ) : (
        isFetchingAssets && (
          <div className="flex items-center">
            <p className="text-secondary">Laddar beslut och dokument</p>
            <Spinner className="ml-10" size={2} />
          </div>
        )
      )}
      {assetsData && assetsData.length > 0 && (
        <CardList
          aria-label="Dokument"
          data={assetsData}
          Card={AssetCard}
          amountDisplayed={5}
          showMoreText="Visa fler"
          showLessText="Visa färre"
        />
      )}
    </section>
  );
};
