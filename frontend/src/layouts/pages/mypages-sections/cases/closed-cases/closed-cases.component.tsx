'use client';

import { CardList } from '@components/cards/cards.component';
import { CasesData } from '@interfaces/case';
import { useRef } from 'react';
import { CaseTableCard } from '../case-table-card.component';
import { Spinner } from '@sk-web-gui/react';

export const ClosedCases: React.FC<{ caseData: CasesData; isFetchingCases: boolean }> = ({
  caseData,
  isFetchingCases,
}) => {
  const ref = useRef<null | HTMLDivElement>(null);

  return (
    <section ref={ref}>
      <h2 className="text-h3">Avslutade</h2>
      <div className="mt-16">
        {caseData?.cases?.length === 0 && !isFetchingCases ? (
          <p>Det finns inga avslutade ärenden</p>
        ) : (
          isFetchingCases && (
            <div className="flex items-center">
              <p className="text-secondary">Laddar avslutade ärenden</p>
              <Spinner className="ml-10" size={2} />
            </div>
          )
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
