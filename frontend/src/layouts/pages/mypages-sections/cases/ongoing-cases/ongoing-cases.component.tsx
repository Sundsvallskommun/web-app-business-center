'use client';

import { CardList } from '@components/cards/cards.component';
import { CasesData } from '@interfaces/case';
import { useRef } from 'react';
import { CaseTableCard } from '../case-table-card.component';

export const OngoingCases: React.FC<{ caseData: CasesData; isFetchingCases: boolean }> = ({
  caseData,
  isFetchingCases,
}) => {
  const ref = useRef<null | HTMLDivElement>(null);

  return (
    <section ref={ref}>
      <h2 className="text-h3">Pågående</h2>
      <div className="mt-16">
        {caseData?.cases?.length === 0 && !isFetchingCases ? (
          <p>Det finns inga pågående ärenden</p>
        ) : (
          isFetchingCases && <p>Laddar pågående ärenden</p>
        )}
        {!isFetchingCases && caseData?.cases?.length > 0 ? (
          <div>
            <CardList showMoreText="Visa fler ärenden" data={caseData?.cases} Card={CaseTableCard} />
          </div>
        ) : null}
      </div>
    </section>
  );
};
