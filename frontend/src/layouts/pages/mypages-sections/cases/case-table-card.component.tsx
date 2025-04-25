import { useAppContext } from '@contexts/app.context';
import { ICaseStatusResponse } from '@interfaces/case';
import { Button, Icon, Label } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { ChevronRight } from 'lucide-react';
import NextLink from 'next/link';

export const CaseTableCard: React.FC<{ item: ICaseStatusResponse }> = ({ item }) => {
  const { representingMode } = useAppContext();

  return (
    <NextLink
      href={`${getRepresentingModeRoute(representingMode)}/arenden/${item.caseId}`}
      aria-label={`Visa ${item.caseType}`}
    >
      <div className={`list-item-card`}>
        <div className="list-item-card-content desktop:grid desktop:grid-cols-[48.6rem_1fr_1fr]">
          <div className="max-w-[40rem] grow">
            <div className="list-item-card-content-title">{item.caseType}</div>
            {item.errandNumber ? (
              <div className="list-item-card-content-subtitle">{`Ärendenummer ${item.errandNumber}`}</div>
            ) : null}
          </div>
          <div>
            {/* TODO: Uncomment when the messages-status is available in the API */}
            {/* <div className="flex gap-x-6 items-center">
              <Callout className="p-0" color="vattjom" />
              <span>Nytt meddelande</span>
            </div> */}
          </div>
          <div>
            <Label rounded inverted={item.status?.color !== 'neutral'} color={item.status?.color}>
              {item?.status?.label}
            </Label>
          </div>
        </div>
        <div className="list-item-card-button">
          <Button as="span" size="lg" variant="tertiary" showBackground={false} iconButton aria-label="Gå till beslut">
            <Icon icon={<ChevronRight />} />
          </Button>
        </div>
      </div>
    </NextLink>
  );
};
