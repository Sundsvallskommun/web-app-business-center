import { CardList } from '@components/cards/cards.component';
import { DecisionItem } from '@data-contracts/backend/data-contracts';
import { useTranslation } from 'react-i18next';
import { DecisionCard } from './decision-card.component';

// Decisions no document owns. Listed below the documents until every source that
// produces decisions also produces the document they belong to.
export const UnlinkedDecisions = ({ decisions }: { decisions: DecisionItem[] }) => {
  const { t } = useTranslation('decisions');

  if (decisions.length === 0) return null;

  return (
    <section className="mb-40">
      <h2 className="text-h3-sm md:text-h3-md xl:text-h3-lg mb-16">{t('decisions:unlinkedDecisions')}</h2>
      <CardList
        aria-label={t('decisions:unlinkedDecisions')}
        data={decisions}
        Card={DecisionCard}
        amountDisplayed={5}
      />
    </section>
  );
};
